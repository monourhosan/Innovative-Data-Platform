import * as XLSX from 'xlsx';
import { SurveyChoice, SurveyFormStructure, SurveyQuestion } from './types';

export interface ParseResult {
  success: boolean;
  structure?: SurveyFormStructure;
  error?: string;
  warnings?: string[];
}

/**
 * Validates and parses an XLSX file according to KoboToolbox / XLSForm standards.
 */
export function parseXlsForm(buffer: ArrayBuffer | Buffer): ParseResult {
  const warnings: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;

    // Find sheets case-insensitively
    const findSheet = (name: string) => {
      return sheetNames.find((s) => s.trim().toLowerCase() === name.toLowerCase());
    };

    const surveySheetName = findSheet('survey');
    const choicesSheetName = findSheet('choices');
    const settingsSheetName = findSheet('settings');

    if (!surveySheetName) {
      return {
        success: false,
        error: "Missing required 'survey' sheet. An XLSForm must contain at least a 'survey' sheet.",
      };
    }

    // 1. Parse Settings
    let formTitle = 'Untitled Survey';
    let formId = `form_${Date.now()}`;
    let version = '1.0';
    let defaultLanguage = 'default';
    const settingsMap: Record<string, string> = {};

    if (settingsSheetName) {
      const settingsSheet = workbook.Sheets[settingsSheetName];
      const settingsData: Record<string, any>[] = XLSX.utils.sheet_to_json(settingsSheet);
      if (settingsData.length > 0) {
        const row = settingsData[0];
        formTitle = row.form_title || row.title || formTitle;
        formId = row.form_id || row.id || formId;
        version = String(row.version || '1.0');
        defaultLanguage = row.default_language || defaultLanguage;

        for (const [k, v] of Object.entries(row)) {
          settingsMap[k] = String(v);
        }
      }
    } else {
      warnings.push("No 'settings' sheet found. Default form title and ID were generated.");
    }

    // 2. Parse Choices
    const choicesMap: Record<string, { name: string; label: string }[]> = {};
    if (choicesSheetName) {
      const choicesSheet = workbook.Sheets[choicesSheetName];
      const choicesData: Record<string, any>[] = XLSX.utils.sheet_to_json(choicesSheet);

      for (const row of choicesData) {
        const listName = String(row.list_name || row['list name'] || '').trim();
        const choiceName = String(row.name || '').trim();
        const choiceLabel = String(row.label || row['label::English'] || choiceName).trim();

        if (listName && choiceName) {
          if (!choicesMap[listName]) {
            choicesMap[listName] = [];
          }
          choicesMap[listName].push({
            name: choiceName,
            label: choiceLabel || choiceName,
          });
        }
      }
    }

    // 3. Parse Survey Questions
    const surveySheet = workbook.Sheets[surveySheetName];
    const surveyData: Record<string, any>[] = XLSX.utils.sheet_to_json(surveySheet);

    if (surveyData.length === 0) {
      return {
        success: false,
        error: "The 'survey' sheet is empty.",
      };
    }

    const questions: SurveyQuestion[] = [];
    let currentGroup: string | undefined = undefined;

    for (let i = 0; i < surveyData.length; i++) {
      const row = surveyData[i];
      const rawType = String(row.type || '').trim();
      const name = String(row.name || '').trim();
      const label = String(row.label || row['label::English'] || name).trim();
      const hint = row.hint ? String(row.hint).trim() : undefined;
      const rawRequired = String(row.required || '').trim().toLowerCase();
      const required = ['yes', 'true', '1'].includes(rawRequired);
      const constraint = row.constraint ? String(row.constraint).trim() : undefined;
      const constraintMessage = row.constraint_message || row['constraint message'] ? String(row.constraint_message || row['constraint message']).trim() : undefined;
      const relevant = row.relevant ? String(row.relevant).trim() : undefined;
      const appearance = row.appearance ? String(row.appearance).trim() : undefined;

      if (!rawType) continue;

      if (rawType.startsWith('begin_group') || rawType.startsWith('begin group')) {
        currentGroup = label || name || 'Group';
        continue;
      }

      if (rawType.startsWith('end_group') || rawType.startsWith('end group')) {
        currentGroup = undefined;
        continue;
      }

      let parsedType = rawType;
      let questionChoices: { name: string; label: string }[] | undefined = undefined;

      // Handle select_one and select_multiple
      if (rawType.startsWith('select_one') || rawType.startsWith('select one')) {
        const parts = rawType.split(/\s+/);
        parsedType = 'select_one';
        const listName = parts[1];
        if (listName && choicesMap[listName]) {
          questionChoices = choicesMap[listName];
        } else if (listName) {
          warnings.push(`Choice list '${listName}' for question '${name}' was not found in 'choices' sheet.`);
        }
      } else if (rawType.startsWith('select_multiple') || rawType.startsWith('select multiple')) {
        const parts = rawType.split(/\s+/);
        parsedType = 'select_multiple';
        const listName = parts[1];
        if (listName && choicesMap[listName]) {
          questionChoices = choicesMap[listName];
        } else if (listName) {
          warnings.push(`Choice list '${listName}' for question '${name}' was not found in 'choices' sheet.`);
        }
      }

      questions.push({
        type: parsedType,
        name: name || `q_${i + 1}`,
        label: label || `Question ${i + 1}`,
        hint,
        required,
        constraint,
        constraint_message: constraintMessage,
        relevant,
        appearance,
        choices: questionChoices,
        group: currentGroup,
      });
    }

    if (questions.length === 0) {
      return {
        success: false,
        error: "No valid questions were extracted from the 'survey' sheet.",
      };
    }

    const structure: SurveyFormStructure = {
      form_id: formId,
      title: formTitle,
      version: version,
      default_language: defaultLanguage,
      questions,
      choices: choicesMap,
      settings: settingsMap,
    };

    return {
      success: true,
      structure,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error parsing Excel file: ${error.message || 'Unknown error'}`,
    };
  }
}

/**
 * Creates a standard KoboToolbox-compatible XLSForm template workbook.
 */
export function generateSampleXlsFormBuffer(): Buffer {
  const surveySheetData = [
    {
      type: 'begin_group',
      name: 'demographics',
      label: 'Demographics & Identification',
    },
    {
      type: 'text',
      name: 'respondent_name',
      label: 'Full Name of Household Head',
      hint: 'Enter full legal name',
      required: 'yes',
    },
    {
      type: 'integer',
      name: 'age',
      label: 'Age in years',
      hint: 'Between 18 and 120',
      required: 'yes',
      constraint: '. >= 18 and . <= 120',
      constraint_message: 'Age must be 18 years or older',
    },
    {
      type: 'select_one gender_list',
      name: 'gender',
      label: 'Gender',
      required: 'yes',
    },
    {
      type: 'select_one edu_list',
      name: 'education_level',
      label: 'Highest level of education attained',
      required: 'no',
    },
    {
      type: 'end_group',
      name: 'demographics',
      label: '',
    },
    {
      type: 'begin_group',
      name: 'living_conditions',
      label: 'Household & Living Conditions',
    },
    {
      type: 'integer',
      name: 'family_size',
      label: 'Total number of family members in household',
      hint: 'Including children',
      required: 'yes',
    },
    {
      type: 'select_multiple assets_list',
      name: 'household_assets',
      label: 'Select all assets currently owned',
      required: 'no',
    },
    {
      type: 'select_one water_source_list',
      name: 'drinking_water_source',
      label: 'Main source of drinking water',
      required: 'yes',
    },
    {
      type: 'date',
      name: 'interview_date',
      label: 'Date of Interview',
      required: 'yes',
    },
    {
      type: 'time',
      name: 'interview_time',
      label: 'Time of Interview',
      required: 'no',
    },
    {
      type: 'text',
      name: 'field_notes',
      label: 'Additional Surveyor Notes & Observations',
      hint: 'Any special remarks',
      required: 'no',
    },
    {
      type: 'end_group',
      name: 'living_conditions',
      label: '',
    },
  ];

  const choicesSheetData = [
    { list_name: 'gender_list', name: 'male', label: 'Male' },
    { list_name: 'gender_list', name: 'female', label: 'Female' },
    { list_name: 'gender_list', name: 'other', label: 'Other / Prefer not to say' },

    { list_name: 'edu_list', name: 'none', label: 'No Formal Education' },
    { list_name: 'edu_list', name: 'primary', label: 'Primary School' },
    { list_name: 'edu_list', name: 'secondary', label: 'Secondary / High School' },
    { list_name: 'edu_list', name: 'tertiary', label: 'College / University Degree' },

    { list_name: 'assets_list', name: 'electricity', label: 'Grid Electricity' },
    { list_name: 'assets_list', name: 'solar', label: 'Solar Power System' },
    { list_name: 'assets_list', name: 'refrigerator', label: 'Refrigerator' },
    { list_name: 'assets_list', name: 'motorcycle', label: 'Motorcycle or Scooter' },
    { list_name: 'assets_list', name: 'smartphone', label: 'Smart Mobile Phone' },

    { list_name: 'water_source_list', name: 'piped', label: 'Piped Water into Dwelling' },
    { list_name: 'water_source_list', name: 'tubewell', label: 'Protected Tube Well / Borehole' },
    { list_name: 'water_source_list', name: 'protected_spring', label: 'Protected Natural Spring' },
    { list_name: 'water_source_list', name: 'rainwater', label: 'Harvested Rainwater' },
    { list_name: 'water_source_list', name: 'surface', label: 'Unprotected River / Lake / Pond' },
  ];

  const settingsSheetData = [
    {
      form_title: 'National Socioeconomic & Field Household Survey 2026',
      form_id: 'household_survey_v1',
      version: '2026.04',
      default_language: 'English',
    },
  ];

  const workbook = XLSX.utils.book_new();

  const surveyWs = XLSX.utils.json_to_sheet(surveySheetData);
  const choicesWs = XLSX.utils.json_to_sheet(choicesSheetData);
  const settingsWs = XLSX.utils.json_to_sheet(settingsSheetData);

  XLSX.utils.book_append_sheet(workbook, surveyWs, 'survey');
  XLSX.utils.book_append_sheet(workbook, choicesWs, 'choices');
  XLSX.utils.book_append_sheet(workbook, settingsWs, 'settings');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return excelBuffer;
}

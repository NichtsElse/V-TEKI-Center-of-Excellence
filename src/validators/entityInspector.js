/**
 * Entity Inspector Module
 * Reads appClient.js and extracts defaultDatabase to build EntityRegistry
 * Infers field types from mock data and identifies relationships
 */

const fs = require('fs');
const path = require('path');
const { getSupabaseTableName, getEntityMapping } = require('./entityMapping');

/**
 * Infer field type from value
 * Returns: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'unknown'
 */
function inferTypeFromValue(value) {
  if (value === null || value === undefined) {
    return 'unknown';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'string') {
    // Check for UUID format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return 'uuid';
    }

    // Check for email format
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'email';
    }

    // Check for ISO date format
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      if (value.includes('T')) {
        return 'timestamp';
      }
      return 'date';
    }

    return 'string';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object') {
    return 'object';
  }

  return 'unknown';
}

/**
 * Infer complete type signature from a field value
 * Returns: { baseType, inferredAs, format }
 */
function inferFieldType(value) {
  const baseType = inferTypeFromValue(value);

  return {
    baseType,
    inferredAs: baseType,
    format: null, // Could be extended with more format info
  };
}

/**
 * Determine if a field is likely a foreign key
 * Heuristics: field name ends with '_id' or 'Id', or is explicitly named as a reference
 */
function isForeignKeyField(fieldName, fieldValue) {
  // Common FK naming patterns
  if (/_id$/i.test(fieldName)) {
    return true;
  }

  // Known FK fields
  const knownFKFields = [
    'batch_id',
    'program_id',
    'registration_id',
    'assessment_id',
    'trainer_id',
    'organization_id',
    'invoice_id',
    'attendance_session_id',
    'certificate_id',
    'participant_id',
  ];

  return knownFKFields.includes(fieldName.toLowerCase());
}

/**
 * Extract entity definitions from appClient.js
 * Reads the file and parses the defaultDatabase object
 */
function readAndInspectEntities(filePath = 'src/api/appClient.js') {
  try {
    const resolvedPath = path.resolve(filePath);
    const content = fs.readFileSync(resolvedPath, 'utf-8');

    // Find the defaultDatabase object
    const dbMatch = content.match(/const\s+defaultDatabase\s*=\s*({[\s\S]*?^};)/m);
    if (!dbMatch) {
      throw new Error('Could not find defaultDatabase in appClient.js');
    }

    const dbContent = dbMatch[1];

    // Parse the object
    // This is a simplified approach - we parse by looking for entity arrays
    const entityRegistry = {};

    // Find all entity definitions: EntityName: [...]
    const entityPattern = /(\w+)\s*:\s*\[([\s\S]*?)\n\s*\],?(?:\n|$)/g;
    let match;

    while ((match = entityPattern.exec(dbContent)) !== null) {
      const entityName = match[1];
      const entityContent = match[2];

      // Get the mapping
      const tableName = getSupabaseTableName(entityName);
      if (!tableName) {
        // Skip if not in mapping (like internal fields)
        continue;
      }

      // Parse the records in this entity
      // Extract first record to infer schema (simplified approach)
      const recordMatch = entityContent.match(/\{([\s\S]*?)\}/);
      if (!recordMatch) {
        entityRegistry[entityName] = {
          supabaseTable: tableName,
          fields: {},
          recordCount: 0,
        };
        continue;
      }

      // Count records
      const recordCount = (entityContent.match(/\{[\s\S]*?\}/g) || []).length;

      // Parse first record to get field structure
      const fields = {};
      const fieldPattern = /(\w+)\s*:\s*(.+?)(?=,\s*\w+\s*:|,?\s*\})/gs;
      let fieldMatch;

      while ((fieldMatch = fieldPattern.exec(recordMatch[1])) !== null) {
        const fieldName = fieldMatch[1];
        const fieldValueStr = fieldMatch[2].trim();

        // Try to infer type from the string representation
        let inferredValue = null;
        try {
          // Simple heuristic parsing
          if (fieldValueStr.startsWith('[')) {
            inferredValue = [];
          } else if (fieldValueStr.startsWith('{')) {
            inferredValue = {};
          } else if (fieldValueStr.match(/^['"`]/)) {
            // String
            inferredValue = 'sample_string';
          } else if (fieldValueStr === 'true' || fieldValueStr === 'false') {
            inferredValue = true;
          } else if (/^\d+$/.test(fieldValueStr)) {
            inferredValue = 123;
          } else if (/^\d+\.\d+$/.test(fieldValueStr)) {
            inferredValue = 123.45;
          } else {
            inferredValue = fieldValueStr;
          }
        } catch (e) {
          inferredValue = fieldValueStr;
        }

        const fieldType = inferFieldType(inferredValue);
        const isFK = isForeignKeyField(fieldName, inferredValue);

        fields[fieldName] = {
          type: fieldType.baseType,
          inferred: fieldType.inferredAs,
          isFK,
        };
      }

      entityRegistry[entityName] = {
        supabaseTable: tableName,
        fields,
        recordCount,
      };
    }

    return entityRegistry;
  } catch (error) {
    console.error(`Error reading entities from ${filePath}:`, error.message);
    throw new Error(`Failed to inspect entities: ${error.message}`);
  }
}

/**
 * Build EntityRegistry by reading appClient.js and creating detailed field information
 * This is a more sophisticated version that actually executes the appClient.js in a safe context
 */
function buildEntityRegistry(appClientPath = 'src/api/appClient.js') {
  try {
    // Read the appClient file
    const resolvedPath = path.resolve(appClientPath);
    let content = fs.readFileSync(resolvedPath, 'utf-8');

    // Extract only the defaultDatabase definition
    const dbMatch = content.match(/const\s+defaultDatabase\s*=\s*([\s\S]*?);[\s\n]*const\s+\w+\s*=/);
    if (!dbMatch) {
      throw new Error('Could not extract defaultDatabase');
    }

    const dbDefinition = dbMatch[1];

    // Safe evaluation using a simple parser
    const entityRegistry = {};

    // Split into entity groups
    const lines = dbDefinition.split('\n');
    let currentEntity = null;
    let braceCount = 0;
    let inEntity = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect entity start: EntityName: [
      const entityStart = trimmed.match(/^(\w+)\s*:\s*\[/);
      if (entityStart) {
        currentEntity = entityStart[1];
        inEntity = true;
        braceCount = 0;

        // Skip if not in mapping
        if (!getSupabaseTableName(currentEntity)) {
          currentEntity = null;
          continue;
        }

        entityRegistry[currentEntity] = {
          supabaseTable: getSupabaseTableName(currentEntity),
          fields: {},
          recordCount: 0,
          sampleRecord: null,
        };
      }

      if (!currentEntity || !inEntity) continue;

      // Count braces to track records
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      // Try to extract first record structure
      if (!entityRegistry[currentEntity].sampleRecord && line.includes('{')) {
        // Find the first complete record
        const recordStart = i;
        let recordLines = [line];
        let recordBraces = 0;

        recordBraces += (line.match(/{/g) || []).length;
        recordBraces -= (line.match(/}/g) || []).length;

        let j = i + 1;
        while (recordBraces > 0 && j < lines.length) {
          recordLines.push(lines[j]);
          recordBraces += (lines[j].match(/{/g) || []).length;
          recordBraces -= (lines[j].match(/}/g) || []).length;
          j++;
        }

        const recordStr = recordLines.join('\n');
        try {
          // Parse field names from record
          const fieldPattern = /(\w+)\s*:\s*(.+?)(?=,\s*\w+\s*:|,?\s*\})/gs;
          let fieldMatch;

          while ((fieldMatch = fieldPattern.exec(recordStr)) !== null) {
            const fieldName = fieldMatch[1];
            const fieldValueStr = fieldMatch[2].trim();

            // Determine field type from the value representation
            let fieldType = 'unknown';

            if (fieldValueStr === 'true' || fieldValueStr === 'false') {
              fieldType = 'boolean';
            } else if (fieldValueStr.match(/^['"`].*['"`]$/)) {
              // It's a string - check for specific formats
              const stringValue = fieldValueStr.slice(1, -1);
              if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stringValue)) {
                fieldType = 'uuid';
              } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
                fieldType = 'email';
              } else if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
                if (stringValue.includes('T')) {
                  fieldType = 'timestamp';
                } else {
                  fieldType = 'date';
                }
              } else {
                fieldType = 'string';
              }
            } else if (/^\d+$/.test(fieldValueStr)) {
              fieldType = 'number';
            } else if (/^\d+\.\d+$/.test(fieldValueStr)) {
              fieldType = 'number';
            } else if (fieldValueStr.startsWith('[')) {
              fieldType = 'array';
            } else if (fieldValueStr.startsWith('{')) {
              fieldType = 'object';
            }

            const isFK = isForeignKeyField(fieldName);

            entityRegistry[currentEntity].fields[fieldName] = {
              type: fieldType,
              inferred: fieldType,
              isFK,
            };
          }
        } catch (e) {
          // Continue even if parsing fails
        }
      }

      // Detect entity end: ]
      if (trimmed === '],' || trimmed === '],') {
        inEntity = false;
        // Count records in the entity (rough estimate)
        if (currentEntity && entityRegistry[currentEntity]) {
          // Count opening braces in the entire entity as record count
          const entityLines = lines.slice(i - 50, i).join('\n'); // Look back
          entityRegistry[currentEntity].recordCount = (entityLines.match(/{/g) || []).length - 1; // -1 for the entity object itself
        }
        currentEntity = null;
      }
    }

    return entityRegistry;
  } catch (error) {
    console.error(`Error building entity registry from ${appClientPath}:`, error.message);
    throw new Error(`Failed to build entity registry: ${error.message}`);
  }
}

/**
 * Get entity registry (cached or fresh)
 */
let cachedEntityRegistry = null;

function getEntityRegistry(appClientPath = 'src/api/appClient.js', forceRefresh = false) {
  if (cachedEntityRegistry && !forceRefresh) {
    return cachedEntityRegistry;
  }

  cachedEntityRegistry = buildEntityRegistry(appClientPath);
  return cachedEntityRegistry;
}

module.exports = {
  readAndInspectEntities,
  buildEntityRegistry,
  getEntityRegistry,
  inferTypeFromValue,
  inferFieldType,
  isForeignKeyField,
};

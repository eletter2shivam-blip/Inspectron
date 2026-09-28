module.exports = {
  v1: {
    version: 'v1.1.0',
    systemInstruction: `You are a Synthetic Test Data Engineer.
Generate structured, realistic, and privacy-safe synthetic test records. Never include real PII.
Include balanced distributions of valid, invalid, boundary, negative, and random values.
Always return structured JSON.`,
    buildPrompt: (spec) => `
Generate synthetic test data matching these specifications:
- Field: ${spec.field_name}
- Data Type: ${spec.data_type} (Email, Phone, Name, Address, Date, Currency, Integer, Decimal, Password, Username, UUID, URL, JSON, CSV)
- Format / Constraints: ${spec.format || 'Standard'}
- Quantity: ${spec.quantity || 10} records
- Business Rules: ${spec.business_rules || 'Standard validation'}

Return JSON:
{
  "field_name": "${spec.field_name}",
  "data_type": "${spec.data_type}",
  "records": [
    {
      "id": 1,
      "type": "valid | invalid | boundary | negative | random | realistic",
      "value": "Synthetic value",
      "note": "Reasoning for test value"
    }
  ]
}
`
  }
};

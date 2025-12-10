"""Examine the structure of the sample Excel file."""
import pandas as pd

# Read Excel file
xl = pd.ExcelFile('PUX_ Talent Mapping  Manager Review_Less VPs_Sheila_CONFIDENTIAL.3.xlsx')

print('Sheet names:', xl.sheet_names)
print('\n' + '='*80)

# Read second tab (index 1)
df = pd.read_excel(xl, sheet_name=1)

print(f'\nSheet 2 name: {xl.sheet_names[1]}')
print(f'Shape: {df.shape} (rows, columns)')

print('\nColumns:')
for i, col in enumerate(df.columns, 1):
    print(f'  {i}. {col}')

print('\nFirst 5 rows:')
print(df.head(5).to_string())

print('\n\nData types:')
print(df.dtypes)

print('\n\nSample values for key columns:')
print('\nUnique values in potential performance-related columns:')
for col in df.columns:
    if any(keyword in str(col).lower() for keyword in ['performance', 'potential', 'rating', 'box', '9']):
        unique_vals = df[col].dropna().unique()
        print(f'\n{col}: {list(unique_vals[:10])}')

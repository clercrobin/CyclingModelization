"""Import Data page - Bulk import from CSV files."""

import streamlit as st
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.models import SessionLocal
from src.utils.csv_importer import CSVImporter, create_sample_csv_templates

st.set_page_config(page_title="Import Data", page_icon="📥", layout="wide")

st.title("📥 Import Data from CSV")

st.markdown("""
Import riders, races, and results in bulk using CSV files. This is much faster than adding them one by one!

### CSV Format Examples

Download the templates below to see the expected format for each type of import.
""")

# Show templates
st.subheader("📋 CSV Templates")

templates = create_sample_csv_templates()

col1, col2, col3 = st.columns(3)

with col1:
    st.write("**Riders Template**")
    st.code(templates['riders'], language='csv')
    st.download_button(
        "Download Riders Template",
        templates['riders'],
        "riders_template.csv",
        "text/csv"
    )

with col2:
    st.write("**Races Template**")
    st.code(templates['races'], language='csv')
    st.download_button(
        "Download Races Template",
        templates['races'],
        "races_template.csv",
        "text/csv"
    )

with col3:
    st.write("**Results Template**")
    st.code(templates['results'], language='csv')
    st.download_button(
        "Download Results Template",
        templates['results'],
        "results_template.csv",
        "text/csv"
    )

st.markdown("---")

# Import tabs
tab1, tab2, tab3 = st.tabs(["Import Riders", "Import Races", "Import Results"])

db = SessionLocal()
importer = CSVImporter(db)

# Tab 1: Import Riders
with tab1:
    st.subheader("Import Riders from CSV")

    st.markdown("""
    **CSV Format:**
    ```
    name,team,country,pcs_id
    Rider Name,Team Name,Country,pcs-id-optional
    ```

    **Required columns:** `name`
    **Optional columns:** `team`, `country`, `pcs_id`
    """)

    riders_file = st.file_uploader("Choose CSV file", type=['csv'], key='riders_upload')

    if riders_file is not None:
        st.write(f"File: {riders_file.name}")

        if st.button("Import Riders", key='import_riders_btn'):
            with st.spinner("Importing riders..."):
                # Save uploaded file temporarily
                temp_path = f"/tmp/{riders_file.name}"
                with open(temp_path, 'wb') as f:
                    f.write(riders_file.getbuffer())

                # Import
                result = importer.import_riders_from_csv(temp_path)

                if result['success'] > 0:
                    st.success(f"✅ Successfully imported {result['success']} riders!")

                if result['errors'] > 0:
                    st.warning(f"⚠️ {result['errors']} errors occurred")
                    if 'error_details' in result:
                        with st.expander("Show error details"):
                            for error in result['error_details'][:10]:  # Show first 10
                                st.write(f"- {error}")

                if 'message' in result:
                    st.error(result['message'])

                # Clean up
                os.remove(temp_path)

# Tab 2: Import Races
with tab2:
    st.subheader("Import Races from CSV")

    st.markdown("""
    **CSV Format (using templates):**
    ```
    name,date,category,country,template
    Race Name,2024-07-14,GT,France,Mountain Stage
    ```

    **CSV Format (custom characteristics):**
    ```
    name,date,category,country,flat,cobbles,mountain,tt,sprint,gc,oneday,endurance
    Race Name,2024-07-14,GT,France,0.1,0.0,1.0,0.0,0.0,0.9,0.0,0.8
    ```

    **Required columns:** `name`, `date`
    **Optional columns:** `category`, `country`, `template`, or individual characteristic weights
    """)

    st.info("**Tip:** Use the `template` column with race type names like 'Mountain Stage', 'Paris-Roubaix', etc. See Manage Data → Add Race for available templates.")

    races_file = st.file_uploader("Choose CSV file", type=['csv'], key='races_upload')

    if races_file is not None:
        st.write(f"File: {races_file.name}")

        if st.button("Import Races", key='import_races_btn'):
            with st.spinner("Importing races..."):
                # Save uploaded file temporarily
                temp_path = f"/tmp/{races_file.name}"
                with open(temp_path, 'wb') as f:
                    f.write(races_file.getbuffer())

                # Import
                result = importer.import_races_from_csv(temp_path)

                if result['success'] > 0:
                    st.success(f"✅ Successfully imported {result['success']} races!")

                if result['errors'] > 0:
                    st.warning(f"⚠️ {result['errors']} errors occurred")
                    if 'error_details' in result:
                        with st.expander("Show error details"):
                            for error in result['error_details'][:10]:  # Show first 10
                                st.write(f"- {error}")

                if 'message' in result:
                    st.error(result['message'])

                # Clean up
                os.remove(temp_path)

# Tab 3: Import Results
with tab3:
    st.subheader("Import Race Results from CSV")

    st.markdown("""
    **CSV Format:**
    ```
    position,rider_name,time_seconds,time_behind_seconds
    1,Tadej Pogačar,14400,0
    2,Jonas Vingegaard,14420,20
    ```

    **Required columns:** `position`, `rider_name`
    **Optional columns:** `time_seconds`, `time_behind_seconds`

    **Note:** Riders must already exist in the database before importing results.
    """)

    # Race selection
    from src.models import Race
    races = db.query(Race).order_by(Race.date.desc()).limit(100).all()

    if races:
        race_options = {f"{r.name} ({r.date.strftime('%Y-%m-%d')})": r.id for r in races}
        selected_race = st.selectbox("Select Race for Results", list(race_options.keys()))

        results_file = st.file_uploader("Choose CSV file", type=['csv'], key='results_upload')

        if results_file is not None:
            st.write(f"File: {results_file.name}")

            if st.button("Import Results", key='import_results_btn'):
                with st.spinner("Importing results..."):
                    race_id = race_options[selected_race]

                    # Save uploaded file temporarily
                    temp_path = f"/tmp/{results_file.name}"
                    with open(temp_path, 'wb') as f:
                        f.write(results_file.getbuffer())

                    # Import
                    result = importer.import_results_from_csv(temp_path, race_id)

                    if result['success'] > 0:
                        st.success(f"✅ Successfully imported {result['success']} results!")
                        st.info("💡 Don't forget to update ratings in 'Manage Data' → 'Update Ratings'!")

                    if result['errors'] > 0:
                        st.warning(f"⚠️ {result['errors']} errors occurred")
                        if 'error_details' in result:
                            with st.expander("Show error details"):
                                for error in result['error_details'][:10]:  # Show first 10
                                    st.write(f"- {error}")

                    if 'message' in result:
                        st.error(result['message'])

                    # Clean up
                    os.remove(temp_path)
    else:
        st.warning("No races found. Import races first before importing results.")

db.close()

st.markdown("---")
st.markdown("""
### Tips for CSV Import

1. **Use UTF-8 encoding** for your CSV files to support special characters
2. **Headers are required** - first row should contain column names
3. **Dates format:** YYYY-MM-DD (e.g., 2024-07-14)
4. **Rider names must match exactly** when importing results
5. **Templates are case-sensitive** when importing races
6. **Missing optional fields** will use default values

### Available Race Templates

You can use these template names in the `template` column when importing races:
- Flat Sprint Stage
- Mountain Stage
- High Mountain Stage
- Medium Mountain Stage
- Individual Time Trial
- Mountain Time Trial
- Paris-Roubaix
- Tour of Flanders
- Liège-Bastogne-Liège
- Milano-Sanremo
- Il Lombardia
- World Championship RR
- World Championship ITT
- Hilly Classic
- Sprint Classic
- Prologue
- Team Time Trial
""")

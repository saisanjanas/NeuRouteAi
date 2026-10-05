\# NEU Route AI - Machine Learning



\## Overview



The ML module predicts landslide size using real-world environmental

and geographical data from the North Eastern Region of India.



\## Real-World Data Sources



1\. NASA Global Landslide Catalog

&#x20;  - Used for historical landslide records.

&#x20;  - Filtered for the 8 North Eastern states.



2\. IMD Gridded Rainfall Data

&#x20;  - 0.25 degree daily rainfall data.

&#x20;  - Used to obtain rainfall at the landslide locations and dates.



3\. SRTM 30 m Elevation Data

&#x20;  - Used to obtain elevation for each landslide location.



No artificial or synthetic training data was created.



\## Dataset



The final ML-ready dataset contains 166 real historical

landslide records.



Features:



\- rainfall\_mm\_day

\- elevation\_m

\- latitude

\- longitude



Target:



\- landslide\_size



Target classes:



\- small

\- medium

\- large

\- very\_large



\## Machine Learning Model



Algorithm:



Random Forest Classifier



The dataset was divided into:



\- 80% training data

\- 20% testing data



A stratified split was used because the target classes are imbalanced.



\## Model Evaluation



Test accuracy:



82.35%



The model also uses precision, recall and F1-score for class-wise

evaluation.



Feature importance from the trained model:



\- Longitude: 0.3126

\- Elevation: 0.2544

\- Latitude: 0.2329

\- Rainfall: 0.2000



\## Inference



The inference module is located in:



ML/inference/predict\_risk.py



The prediction function accepts:



\- rainfall

\- elevation

\- latitude

\- longitude



It returns:



\- predicted landslide size

\- application risk score

\- application risk level



Example:



{

&#x20;   "predicted\_landslide\_size": "medium",

&#x20;   "risk\_score": 0.50,

&#x20;   "risk\_level": "Moderate"

}



\## Important Limitation



The current model predicts landslide size among historical

recorded landslide events.



It is not a validated probability model for predicting whether

a completely safe road will experience a landslide.



The risk score and risk level are application-level mappings

from the predicted landslide-size class and should not be

interpreted as probability values.



\## Project Structure



ML/

├── data/

├── models/

├── inference/

│   └── predict\_risk.py

├── clean\_landslides.py

├── get\_elevation.py

├── merge\_features.py

├── prepare\_ml\_dataset.py

├── train\_model.py

└── README.md


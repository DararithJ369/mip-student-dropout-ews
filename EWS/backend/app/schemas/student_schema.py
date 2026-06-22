from pydantic import BaseModel
from typing import Literal


class StudentInput(BaseModel):
    gender: Literal["Male", "Female", "Other"]
    age: int
    province: Literal[
        "Phnom Penh", "Kandal", "Kampot", "Takeo", "Battambang", 
        "Kampong Cham", "Siem Reap", "Prey Veng", "Banteay Meanchey", 
        "Kampong Thom", "Pursat", "Svay Rieng", "Kep", "Koh Kong"
    ]
    
    living_with: Literal["Both parents", "One parent", "Guardians/Relatives"]
    distance: Literal["Less than 1km", "between 1km-5km", "More than 5km"]
    transport: Literal["Motorbike", "Bicycle", "Walk", "Car"]
    attendance: Literal["0 - 2 days", "3 -4 days", "5 - 6 days"]
    monthly_average: Literal["Less than 25.00", "Between 25.00 to 40.00", "More than 40.00"]
    absence: Literal["Never", "Rarely", "Sometimes", "Often"]
    parental_education: Literal["No education", "Primary school", "Secondary School", "High School", "Higher education"]
    family_income: Literal["Low", "Medium"]
    work_support: Literal["Yes", "No"]
    external_support: Literal["Yes", "No"]
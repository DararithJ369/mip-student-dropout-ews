
def engineer_features(df):    
    
    df['attendance_quality'] = (
        df['attendance'] 
        - df['absence']
    )
    
    df['engagement_score'] = (
        df['attendance']
        + df['monthly_average']
        - df['absence']
    )
    
    df['ses_score'] = (
        df['family_income']
        + df['parental_education']
        + df['external_support']
    )
    
    df['support_index'] = (
        df['living_with']
        + df['external_support']
        + df['parental_education']
    )   
    
    df['commute_burden'] = (
        df['distance']
        + df['transport']
    )
    
    features = [
        "attendance_quality",
        "engagement_score",
        "ses_score",
        "support_index",
        "commute_burden",
    ]
    return df[features]
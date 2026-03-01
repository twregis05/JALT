// src/config.js
const PROFILE_CONFIG = [
    { 
        id: 'state', 
        label: 'State of Residence', 
        type: 'select', 
        options: [
            {v: 'AL', t: 'Alabama'}, {v: 'AK', t: 'Alaska'}, {v: 'AZ', t: 'Arizona'}, {v: 'AR', t: 'Arkansas'},
            {v: 'CA', t: 'California'}, {v: 'CO', t: 'Colorado'}, {v: 'CT', t: 'Connecticut'}, {v: 'DE', t: 'Delaware'},
            {v: 'FL', t: 'Florida'}, {v: 'GA', t: 'Georgia'}, {v: 'HI', t: 'Hawaii'}, {v: 'ID', t: 'Idaho'},
            {v: 'IL', t: 'Illinois'}, {v: 'IN', t: 'Indiana'}, {v: 'IA', t: 'Iowa'}, {v: 'KS', t: 'Kansas'},
            {v: 'KY', t: 'Kentucky'}, {v: 'LA', t: 'Louisiana'}, {v: 'ME', t: 'Maine'}, {v: 'MD', t: 'Maryland'},
            {v: 'MA', t: 'Massachusetts'}, {v: 'MI', t: 'Michigan'}, {v: 'MN', t: 'Minnesota'}, {v: 'MS', t: 'Mississippi'},
            {v: 'MO', t: 'Missouri'}, {v: 'MT', t: 'Montana'}, {v: 'NE', t: 'Nebraska'}, {v: 'NV', t: 'Nevada'},
            {v: 'NH', t: 'New Hampshire'}, {v: 'NJ', t: 'New Jersey'}, {v: 'NM', t: 'New Mexico'}, {v: 'NY', t: 'New York'},
            {v: 'NC', t: 'North Carolina'}, {v: 'ND', t: 'North Dakota'}, {v: 'OH', t: 'Ohio'}, {v: 'OK', t: 'Oklahoma'},
            {v: 'OR', t: 'Oregon'}, {v: 'PA', t: 'Pennsylvania'}, {v: 'RI', t: 'Rhode Island'}, {v: 'SC', t: 'South Carolina'},
            {v: 'SD', t: 'South Dakota'}, {v: 'TN', t: 'Tennessee'}, {v: 'TX', t: 'Texas'}, {v: 'UT', t: 'Utah'},
            {v: 'VT', t: 'Vermont'}, {v: 'VA', t: 'Virginia'}, {v: 'WA', t: 'Washington'}, {v: 'WV', t: 'West Virginia'},
            {v: 'WI', t: 'Wisconsin'}, {v: 'WY', t: 'Wyoming'}
        ],
        desc: 'Identify your primary tax jurisdiction.'
    },
    { 
        id: 'income', 
        label: 'Annual Gross Income', 
        type: 'number', 
        desc: 'Total capital inflow per cycle.',
        placeholder: 'e.g. 75000' 
    },
    { 
        id: 'housing', 
        label: 'Living Situation', 
        desc: 'Identify your primary shelter obligation.', 
        type: 'select', 
        options: [{v: 'rent', t: 'Rent'}, {v: 'mortgage', t: 'Mortgage'}, {v: 'own', t: 'Own Outright'}] 
    }
];
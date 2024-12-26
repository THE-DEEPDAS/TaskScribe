const config = {
    azureKey: 'YOUR_AZURE_SUBSCRIPTION_KEY',
    azureRegion: 'YOUR_AZURE_REGION'
};

// Add supported regions info
config.regions = [
    'eastus',
    'eastus2',
    'southcentralus',
    'westus2',
    'westus3',
    'northeurope',
    'westeurope'
];

// Add supported languages info
config.languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' }
];

// Validate config
if (!config.azureKey || config.azureKey === 'YOUR_AZURE_SUBSCRIPTION_KEY') {
    console.error('Please configure your Azure Speech Service credentials in config.js');
}

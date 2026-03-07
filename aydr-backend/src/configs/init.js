const dotenv = require("dotenv");
const { parseArgs } = require("node:util");

const options = {
    environment: {
        type: 'string',
        default: 'local'
    }
};

const { values } = parseArgs({ options });
const environment = values.environment;

const allowedEnvironments = [ 'local', 'labrotary', 'production' ];
if (!allowedEnvironments.includes(environment)) {
    console.error("Invalid environment passed!");
    process.exit(1);
}

dotenv.config({ path: '.env' });
dotenv.config({ path: `.env.${environment}`, override: true });

console.log(`Environment ${environment} initialized successfully.`);



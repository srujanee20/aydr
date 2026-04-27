const dotenv = require("dotenv");
const { parseArgs } = require("node:util");

const options = {
    env: {
        type: 'string',
        default: 'local'
    }
};

const { values } = parseArgs({ options });
const env = values.env;

dotenv.config({ path: '.env' });
dotenv.config({ path: `.env.${env}`, override: true });

console.log(`Environment ${env} initialized successfully.`);
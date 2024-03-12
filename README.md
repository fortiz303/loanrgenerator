# Files

- config.json - main config file;
- lenders.json - created Lenders accounts;
- loans.log - published loan requests;
- error.log - contain possible errors;
- descriptions.ts - loan request descriptions;

# Don't delete files - only cleaning up if needed:

- error.log,
- lenders.json,
- loans.log

# Config:

apiUrl: "https://getloanr.com/backend/v1",
intervalInHours: 4.8, - 5 iterations per day (24/5=4.8);
isLendersCreated: false,
lendersCount: 15 - a random lender will be picked every iteration;

- **apiUrl** - backend url for sending requests (create user/loan, grant/confir/repay loan request),
- **intervalInHours** - interval for runing main script, specified in hours, if needed 30min - set 0.5, etc
- **isLendersCreated** - initially false, will be changed to true, after creation Lenders accounts, prevents creating Lenders accounts every script iteration;
- **lendersCount** - Quantity of Lenders accounts to be created,initially 15;

### Run script:

- docker compose build;
- docker compose up

### Change script running interval, by default - every 3 hours:

config.json => "intervalInHours"

### Add new loan request description:

descriptions.ts => ["...","new description"]

### Renew Lenders accounts:

- docker compose down
- Clean up lenders.json, don't delete file lenders.json
- Change config.json => "isLendersCreated" to false
- docker compose build;
- docker compose up

### Change Lenders count:

- docker compose down
- Clean up lenders.json, don't delete file lenders.json
- Change config.json => "isLendersCreated" to false
- Change config.json => "lendersCount" to desired number
- docker compose build;
- docker compose up

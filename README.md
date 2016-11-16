# time-converter
Convert harvest time report to Paychex TIME0002 import format

# Setup

1. Move the contents of the `example-config` into a `~/.timeConvert` folder
2. Edit the three files in that folder.
    1. employeeIdMap is a simple mapping of id's in harvest to ids in paychex for the employees
    1. taskIdMap is a mapping of "special" tasks that need to have specific codes in paychex.  An example would be the task in harvest that is vacation, this usually needs recorded to be deducted from the correct bucket of hours.
    1. email config to send the report to who needs it after is is run

# Run

  - `npm start` will run the conversion and send the report
  - `node reminder` will send a reminder email to the "reminderEmail" that is specified in the emailConfig.  This is useful if you want to have also add a cron reminder email to be sent prior to the report being generated.

# New Employee

Generally what you have to do for on/off boarding of employees is add the harvest id and paychex id to the employeeIdMap.json file. 

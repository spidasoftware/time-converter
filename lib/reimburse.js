var _ = require('lodash');

function Reimbuse(employeeIdMap) {
  this.employeeIdMap = employeeIdMap;
}

Reimbuse.prototype.process = function process(allExpenses, expenseCategories, allUsers){

  let self = this;
  allUsers = allUsers || [];

  return _.reduce(allExpenses, function(summedEntries, expense){

    if (!expense.expense.is_closed) {
      console.error("" + allUsers[expense.expense.user_id] + " has unapproved expense")
    }
    var employeeId = self.employeeIdMap[expense.expense.user_id];

    if (employeeId) {

      var lineToWrite = [employeeId];
      var reimbursible = _.find(expenseCategories, function(expenseCategory){
        return expenseCategory.expense_category.id==expense.expense.expense_category_id && expenseCategory.expense_category.name.indexOf("Reimbursable")>=0
      });

      if(reimbursible){
        lineToWrite.push("D"); //D or E
        lineToWrite.push("R1");
        lineToWrite.push("") //hours
        lineToWrite.push(expense.expense.total_cost) //Amount

        summedEntries.push(lineToWrite);
      }
    }
    return summedEntries;
  }, []);
};

module.exports = Reimbuse;

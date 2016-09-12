var assert = require('assert'),
    Reimburse = require('../lib/reimburse'),
    _ = require('lodash'),
    fs = require('fs');

var allExpenses = JSON.parse(fs.readFileSync("./test/reimburse-fixture.json"));
var expenseCategories = JSON.parse(fs.readFileSync("./test/expense-categories-fixture.json"));

describe('reimburse', function() {
  describe('reimbursible', function() {
    it('should return only reimbursible expenses', function() {

      var employeeIdMap = {}
      _.each(allExpenses, function(expense){
        employeeIdMap[expense.expense.user_id]=expense.expense.user_id
      })

      var reimburse = new Reimburse(employeeIdMap)

      var reimbursed = reimburse.process(allExpenses, expenseCategories);

      assert.equal(1, reimbursed.length, "should have correct number of entries");
      console.log(reimbursed[0][4].toFixed(2))
      assert.equal((9.3+10.15).toFixed(2), reimbursed[0][4].toFixed(2), "should have summed the cost");

    });
  });
});

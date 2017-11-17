/**
 * Created by Harry on 24/01/2017.
 */

var rule = (function() {
  var module = {};
  var columns;

  // ruleColumns format:
  // [columnName1, columnName2, ...]
  module.addCondition = function(ele, ruleColumns, defaultRules, defaultName, superCondition, type) {
    var li = $('<li class="conditions"></li>');
    if (type == 'super condition' || superCondition && superCondition == defaultName) {
      var label = $('<label>Rule will only be applied to students that satisfy this condition. </label>');
      var inputName = $('<input style="display: none;" class="conditionName" />');
      inputName.val('SuperConditionDefault');
    } else {
      var label = $('<label>Condition Name: </label>');
      var inputName = $('<input class="conditionName" />');
    }
    var expressionDiv = $('<div class="expressions"></div>');
    var deleteButton = $('<button class="article-btn"><i class="fa fa-trash" aria-hidden="true"></i><h5>Delete</h5></button>');
    var checkbox = $('<label style="display: none;"><input type="checkbox" class="superCondition" />Student Filter</label>');

    // change ruleColumns format to:
    // [{id: 'columnName1',label: 'Column Name 1',type: 'string'},{id: 'columnName2',label: 'Column Name 2',type: 'string'}, ...]
    columns = [];
    for (var i = 0; i < ruleColumns.length; i++) {
      columns[i] = {
        id: ruleColumns[i],
        label: ruleColumns[i],
        type: 'string',
        operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal']
      };
    } 
    var testArr = [];
    _checkRuleExpressId(testArr, defaultRules.rules);
    var mark = false;
    for (var i=0; i<testArr.length; i++) {
      if (ruleColumns.indexOf(testArr[i]) < 0) {
        alert("Matrix doesn't contain column " + testArr[i] + ", please add this column into matrix.");
        mark = true;
      }
    }
    if (mark) {
      return false;
    }
    if (columns.length === 0) {
      alert('My data does not have any data. Please finish data association first.');
      return false;
    }

    ele.append(li);
    li.append(label);
    li.append(inputName);
    li.append(deleteButton);
    li.append(checkbox);
    li.append(expressionDiv);
    if (defaultName) {
      inputName.val(defaultName);
    }

    expressionDiv.ready(function() {
      var rules_basic
      if (defaultRules) {
        rules_basic = defaultRules;
      } else {
        rules_basic = {
          condition: 'AND',
          rules: [{
            id: ruleColumns[0],
            operator: 'equal'
          }]
        };
      }

      $j(expressionDiv).queryBuilder({
        plugins: [],

        filters: columns,

        rules: rules_basic
      });

    });

    deleteButton.click(function() {
      module.delete(li);
      if (type == 'super condition' || (superCondition && superCondition == defaultName)) {
        $("#addSuperCondition").show();
      }
    });

    if (type == 'super condition' || superCondition && superCondition == defaultName) {
      $(".superCondition").prop('checked', false);
      $("#addSuperCondition").hide();
      checkbox.children().prop('checked', true);

      li.insertBefore($(".conditions")[0]).hide().show('slow');
      $(".conditions").each(function() {
        $(this).css({"background": "#FFFFFF",
          "border":"none"});
      });
      li.css({"display": "list-item",
        "background": "rgb(237, 241, 176)",
        "border": "3px solid #86bc42",
        "border-radius": "5px",
        "padding": "10px",
        "margin": "0px"});
    }

    //if () {
    //  $("#addSuperCondition").hide();
    //  checkbox.children().prop('checked', true);
    //  li.insertBefore($(".conditions")[0]).hide().show('slow');
    //  $(".conditions").each(function() {
    //    $(this).css({"background": "#FFFFFF",
    //                 "border": "none"});
    //  });
    //  li.css({"display": "list-item",
    //          "background": "rgb(237, 241, 176)",
    //          "border": "3px solid #86bc42",
    //          "border-radius": "5px",
    //          "padding": "10px",
    //          "margin": "0px"});
    //}
  };

  module.delete = function(ele) {
    ele.remove();
  };

  module.parseCondition = function() {
    var returnConditions = {};
    var superCondition = '';
    var error;
    var conditionNames = [];
    var ele = 0;

    var conditionsDivs = $('.conditions');
    conditionsDivs.each(function(item) {
      var conditionsDiv = $j(conditionsDivs[item]);
      var name = conditionsDiv.find('.conditionName').val();

      if (!name) {
        return false;
      }
      if (conditionNames.indexOf(name) > -1) {
        error = 'Conditions name cannot be repeated!';
        ele = conditionsDiv;
      } else {
        conditionNames.push(name);
      }
      var queryBuilderResult = conditionsDiv.find('.expressions').queryBuilder('getRules');

      var expression = [];
      if (queryBuilderResult) {
        // change queryBuilder format to ontask rules format
        _convertQueryBuilderExpressionToOntaskExpression(queryBuilderResult['rules'], expression, queryBuilderResult['condition']);
      }

      returnConditions[name] = expression;

      if (conditionsDiv.find('.superCondition').is(':checked')) {
        superCondition = name;
      }
    });
    if (error) {
      return {error: error, ele: ele};
    } else {
      return {conditions: returnConditions, superCondition: superCondition};
    }
  };

  module.loadCondition = function (ele, ruleColumns, obj, superCondition) {
    for (var key in obj) {
      if(obj[key].length > 0) {
        module.addCondition(ele, ruleColumns, _convertOntaskExpressionToQueryBuilderExpression(obj[key]), key, superCondition);
      }
    }
  };

  return module;
}());


function _convertQueryBuilderExpressionToOntaskExpression(ele, expression, condition) {
  for (var i = 0; i < ele.length; i++) {
    var rule = ele[i];
    if (rule.hasOwnProperty('condition')) {
      var subEle = {
        expressions: [],
        logical: condition === 'OR' ? '||' : '&&'
      };
      expression.push(subEle);
      _convertQueryBuilderExpressionToOntaskExpression(rule['rules'], subEle['expressions'], rule['condition']);
    } else {
      expression.push({
        target: rule.id,
        symbol: _convertOperatorNameToSymbol(rule.operator),
        value: rule.value,
        logical: condition === 'OR' ? '||' : '&&'
      });
    }
  }
}

function _convertOperatorNameToSymbol(operatorName) {
  var operator;
  switch (operatorName) {
    case 'equal':
      operator = '==';
      break;
    case 'not_equal':
      operator = '!=';
      break;
    case 'less':
      operator = '<';
      break;
    case 'less_or_equal':
      operator = '<=';
      break;
    case 'greater':
      operator = '>';
      break;
    case 'greater_or_equal':
      operator = '>=';
      break;
    default:
      operator = '==';
  }
  return operator;
}


// Convert Ontask fonditions format to QuertBuilder format, eg.
// var testdata = [{
//   "target": "id",
//   "symbol": "==",
//   "value": "1",
//   "logical": "&&"
// }, {
//   "target": "email",
//   "symbol": "!=",
//   "value": "ken",
//   "logical": "&&"
// }, {
//   "expressions": [{
//     "target": "id",
//     "symbol": "==",
//     "value": "2",
//     "logical": "||"
//   }, {
//     "target": "email",
//     "symbol": "!=",
//     "value": "max",
//     "logical": "||"
//   }, {
//     "expressions": [{
//       "target": "id",
//       "symbol": "<",
//       "value": "10",
//       "logical": "&&"
//     }, {
//       "target": "email",
//       "symbol": "==",
//       "value": "harry",
//       "logical": "&&"
//     }],
//     "logical": "||"
//   }],
//   "logical": "&&"
// }];
// var testexpression = _convertOntaskExpressionToQueryBuilderExpression(testdata);

function _convertOntaskExpressionToQueryBuilderExpression(ele) {
  var rootExpression = {
    condition: ele[0].logical === '||' ? 'OR' : 'AND',
    valid: true,
    rules: []
  };

  if (ele.length > 0) {
    _convertOntaskExpressionToQueryBuilderExpressionSub(ele, rootExpression['rules'], ele[0].logical);
  }
  return rootExpression;
}

function _convertOntaskExpressionToQueryBuilderExpressionSub(ele, expression, condition) {
  for (var i = 0; i < ele.length; i++) {
    var rule = ele[i];
    if (rule.hasOwnProperty('expressions') && rule['expressions'].length > 0) {
      var subEle = {
        condition: rule['expressions'][0].logical === '||' ? 'OR' : 'AND',
        rules: []
      };
      expression.push(subEle);
      _convertOntaskExpressionToQueryBuilderExpressionSub(rule['expressions'], subEle['rules'], rule['expressions'][0]['logical']);
    } else {
      expression.push({
        id: rule.target,
        field: rule.target,
        type: 'string',
        input: 'text',
        operator: _convertSymbolToOperatorName(rule.symbol),
        value: rule.value
      });
    }
  }
}

function _checkRuleExpressId(arr, rules) {
  for (var i=0; i<rules.length; i++) {
    if (rules[i].rules && rules[i].rules.length > 0) {
      _checkRuleExpressId(arr, rules[i].rules);
    } else {
      arr.push(rules[i].id);
    }
  }
}

function _convertSymbolToOperatorName(symbol) {
  var returnSymbol;
  switch (symbol) {
    case '==':
      returnSymbol = 'equal';
      break;
    case '!=':
      returnSymbol = 'not_equal';
      break;
    case '<':
      returnSymbol = 'less';
      break;
    case '<=':
      returnSymbol = 'less_or_equal';
      break;
    case '>':
      returnSymbol = 'greater';
      break;
    case '>=':
      returnSymbol = 'greater_or_equal';
      break;
    default:
      returnSymbol = 'equal';
  }
  return returnSymbol;
}

// set jquery back
window.$j = $.noConflict(true);

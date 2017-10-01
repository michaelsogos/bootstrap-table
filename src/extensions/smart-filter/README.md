# Table Smart Filter

Use Plugin: [bootstrap-table-smart-filter](https://github.com/wenzhixin/bootstrap-table/tree/master/src/extensions/smart-filter) 

## Usage

Include the javascript file into page.
```html
<script src="extensions/smart-filter/bootstrap-table-smart-filter.js"></script>
```

Then assure that each column should be filtered by SmartFilter have [fieldType](#fieldType) properly configured else that column will not appear in filterable fields.



## Options

### smartFilter
* type: Boolean
* description: Set true to allow the smart filter.
* default: `false`

### smartFilterEnableSaveQuery
* type: Boolean
* description: Set true to allow smart filter to save query
* default: `false`


## Column options

### fieldType
* type: String
* description: Set the data type; `string`: for generic string, `number`: only to evaluate condition for numbers, `date`: to better evaluate date conditions.
* default: `undefined`



## Locale

### formatSmartFilter
* description: Tooltip on toolbar button
* default: `Smart filter generator`

### formatSmartFilterSaveButton
* description: Save button label
* default: `Save`

### formatSmartFilterModalTitle
* description: Modal dialog title
* default: `Smart Filter`

### formatSmartFilterAddButton
* description: Add button label
* default: `Add`

### formatSmartFilterApplyButton
* description: Apply button label
* default: `Apply`

### formatSmartFilterResetButton
* description: Reset button label
* default: `Reset`

### formatSmartFilterGroupRulesButton
* description: Group rules button label
* default: `Group rules`

### formatSmartFilterFieldListLabel
* description: Fields dropdown label
* default: `The field`

### formatSmartFilterOperatorLabel
* description: Operators dropdown label
* default: `that`

### formatSmartFilterOperatorIs
* description: Operator IS\HAS label
* default: `is\has`

### formatSmartFilterOperatorNotIs
* description: Operator IS\HAS NOT label
* default: `is\has not`

### formatSmartFilterValueLabel
* description: Value field label
* default: `the value`

### formatSmartFilterCaseSensitive
* description: Case sensitive label
* default: `case sensitive`

### formatSmartFilterCaseInsensitive
* description: Case insensitive label
* default: `case insensitive`

### formatSmartFilterOperatorEqualsTo
* description: Operator EQUALS TO label
* default: `equals to`

### formatSmartFilterOperatorContains
* description: Operator CONTAINS label
* default: `contains`

### formatSmartFilterOperatorStartsWith
* description: Operator STARTS WITH label
* default: `starts with`

### formatSmartFilterOperatorEndsWith
* description: Operator ENDS WITH label
* default: `ends with`

### formatSmartFilterOperatorLength
* description: Operator LENGTH OF label
* default: `length of`

### formatSmartFilterOperatorGreaterThan
* description: Operator GREATER THAN label
* default: `greater than`

### formatSmartFilterOperatorLessThan
* description: Operator LESS THAN label
* default: `less than`

### formatSmartFilterOperatorLessThanOrEqualTo
* description: Operator LESS THAN OR EQUALS TO label
* default: `less than or equal to`

### formatSmartFilterOperatorGreaterThanOrEqualTo
* description: Operator GREATER THAN OR EQUALS TO label
* default: `greater than or equal to`

### formatSmartFilterOperatorYearIs
* description: Operator YEAR EQUALS TO label
* default: `year equals to`

### formatSmartFilterOperatorMonthIs
* description: Operator MONTH EQUALS TO label
* default: `month equals to`

### formatSmartFilterOperatorDayIs
* description: Operator DAY EQUALS TO label
* default: `day equals to`

### formatSmartFilterOperatorHourIs
* description: Operator HOUR EQUALS TO label
* default: `hour equals to`

### formatSmartFilterOperatorMinuteIs
* description: Operator MINUTE EQUALS TO label
* default: `minute equals to`

### formatSmartFilterOperatorSecondIs
* description: Operator SECOND EQUALS TO label
* default: `second equals to`

### formatSmartFilterOperandAnd
* description: Operand AND label
* default: `and`

### formatSmartFilterOperandOr
* description: Operand OR label
* default: `or`

### formatSmartFilterRuleNotComplete
* description: Error message when rule is not complete
* default: `Please, complete the rule before add it!`


### formatSmartFilterErrorRuleAlreadyExist
* description: Error message when rule already exist
* default: `This rule already exist!`

### formatSmartFilterSelectMoreRulesToGroup
* description: Error message when selected rules are less than two, so not enought for create a group of rules
* default: `Select two or more rules!`

### formatSmartFilterNotSequentialSelection
* description: Error message when rules are not sequentially selected
* default: `Please, select items sequentially !`

### formatSmartFilterEmptyRulesContainer
* description: Message that appera when no rules has been created yet
* default: `No rules has been configured yet`

## Events

### onColumnSearch(column-search.bs.table)

* Fired when we are searching into the column data

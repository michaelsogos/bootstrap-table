/**
 * @author: Michael Sogos <michael.sogos@gurustudioweb.it>
 * @version: v1.0.0 
 */

(function ($) {
    'use strict';
    var sprintf = $.fn.bootstrapTable.utils.sprintf;

    //#region "Add to bootstrap-table configurations"
    $.extend($.fn.bootstrapTable.defaults, {
        smartFilter: false,
    });

    $.extend($.fn.bootstrapTable.defaults.icons, {
        smartFilterIcon: 'glyphicon-filter'
    });

    $.extend($.fn.bootstrapTable.Constructor.EVENTS, {
        'column-advanced-search.bs.table': 'onColumnAdvancedSearch'
    });

    $.extend($.fn.bootstrapTable.locales, {
        formatSmartFilter: function () { return 'Smart filter generator'; },
        formatSmartFilterSaveButton: function () { return 'Save'; },
        formatSmartFilterModalTitle: function () { return 'Smart Filter' },
        formatSmartFilterAddButton: function () { return 'Add' },
        formatSmartFilterApplyButton: function () { return 'Apply' },
        formatSmartFilterResetButton: function () { return 'Reset' },
        formatSmartFilterGroupRulesButton: function () { return 'Group rules' },
        formatSmartFilterFieldListLabel: function () { return 'The field' },
        formatSmartFilterOperatorLabel: function () { return 'that' },
        formatSmartFilterOperatorIs: function () { return 'is\\has' },
        formatSmartFilterOperatorNotIs: function () { return 'is\\has not' },
        formatSmartFilterValueLabel: function () { return 'the value' },
        formatSmartFilterCaseSensitive: function () { return 'case sensitive' },
        formatSmartFilterCaseInsensitive: function () { return 'case insensitive' },
        formatSmartFilterOperatorEqualsTo: function () { return 'equals to' },
        formatSmartFilterOperatorContains: function () { return 'contains' },
        formatSmartFilterOperatorStartsWith: function () { return 'starts with' },
        formatSmartFilterOperatorEndsWith: function () { return 'ends with' },
        formatSmartFilterOperatorLength: function () { return 'length of' },
        formatSmartFilterOperatorGreaterThan: function () { return 'greater than' },
        formatSmartFilterOperatorLessThan: function () { return 'less than' },
        formatSmartFilterOperatorLessThanOrEqualTo: function () { return 'less than or equal to' },
        formatSmartFilterOperatorGreaterThanOrEqualTo: function () { return 'greater than or equal to' },
        formatSmartFilterOperatorYearIs: function () { return 'year equals to' },
        formatSmartFilterOperatorMonthIs: function () { return 'month equals to' },
        formatSmartFilterOperatorDayIs: function () { return 'day equals to' },
        formatSmartFilterOperatorHourIs: function () { return 'hour equals to' },
        formatSmartFilterOperatorMinuteIs: function () { return 'minute equals to' },
        formatSmartFilterOperatorSecondIs: function () { return 'second equals to' },
        filter_label_rule_and: 'and',
        filter_label_rule_or: 'or',
        formatSmartFilterRuleNotComplete: function () { return 'Please, complete the rule before add it!' },
        filter_label_error_emptyFilterName: 'Please, specify a name for the filter!',
        filter_label_error_noRule: 'Please, compose at least one rule!',
        filter_label_error_ruleAlreadyExist: 'This rule already exist!',
        filter_label_error_ruleNameAlreadyUsed: 'A rule with this name already exist!',
        filter_label_error_unselectedRules: 'Select two or more rules!',
        filter_label_error_notSequentialSelection: 'Please, select items sequentially !',
        filter_label_temporaryFilter: 'building filter ...'
    });

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
    //#endregion

    //#region "Register to specific bootstrap-table initializer"
    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initToolbar = BootstrapTable.prototype.initToolbar;
    //#endregion

    //#region "Add button to toolbar"
    BootstrapTable.prototype.initToolbar = function () {
        this.showToolbar = this.options.smartFilter;
        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.smartFilter) {
            return;
        }

        $.proxy(this.showSmartFilterGenerator, this)();

        var $btnGroup = this.$toolbar.find('>.btn-group'),
            $btnSmartFilter = $btnGroup.find('.smart-filter-button');

        if (!$btnSmartFilter.length) {
            var buttonSizeClass = this.options.iconSize === undefined ? '' : sprintf(' btn-%s', this.options.iconSize);
            $btnSmartFilter = $([
                sprintf('<button class="btn btn-default %s smart-filter-button" data-toggle="modal" data-target="#smart-filter-modal-%s" type="button" title="%s">', buttonSizeClass, this.$el[0].id, this.options.formatSmartFilter()),
                sprintf('<i class="%s %s"></i></button>', this.options.iconsPrefix, this.options.icons.smartFilterIcon)
            ].join('')).appendTo($btnGroup);
        }
    };
    //#endregion

    //#region "Smart Filter Generator"
    BootstrapTable.prototype.showSmartFilterGenerator = function () {
        var modal = $('body').find('#smart-filter-view-' + this.$el[0].id);
        if (!modal.length) {
            var template = smartFilterModalTemplate(this);

            $.each(this.columns, function (index, item) {
                var dataField = $('<a href="#"></a>').data({ fieldName: item.field, fieldLabel: item.title, fieldType: item.fieldType }).html(item.title);
                var listItem = $('<li>').append(dataField);
                template.find('#fields-list').append(listItem);
            });

            //register events
            template.find('#fields-list').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldsListChanged);
            template.find('#field-pre-operators').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldPerOperatorsChanged);
            template.find('#field-operators').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldOperatorsChanged);
            template.find('#filter-value-case').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldValueCaseChanged);
            template.find('#filter-action-container').on('click', 'button.button-add', { instance: this }, BootstrapTable.prototype.smartFilterAddRule);

            $('body').append(template);
        }
    }
    //#endregion

    //#region "Events"
    BootstrapTable.prototype.smartFilterFieldsListChanged = function (event) {
        var listItem = $(this); //<a>
        var button = listItem.parents('ul').prevAll('button'); //<button>
        button.find(".selected-label").text(listItem.text());
        button.data(listItem.data());
        button.removeClass('btn-default');
        button.addClass('btn-info');
        smartFilterLoadOperatorList(event.data.instance, listItem);
        smartFilterResetRuleButtons(listItem);
    }

    BootstrapTable.prototype.smartFilterFieldPerOperatorsChanged = function (event) {
        var listItem = $(this); //<a>
        var button = listItem.parents('ul').prevAll('button'); //<button>
        button.find(".selected-label").text(listItem.text());
        button.val(listItem.data().value);
    }

    BootstrapTable.prototype.smartFilterFieldOperatorsChanged = function (event) {
        var listItem = $(this); //<a>
        var button = listItem.parents('ul').prevAll('button'); //<button>
        button.find(".selected-label").text(listItem.text());
        button.val(listItem.data().value);
        button.removeClass('btn-default');
        button.addClass('btn-info');
        smartFilterRenderInputFieldValue(listItem);
    }

    BootstrapTable.prototype.smartFilterFieldValueCaseChanged = function (event) {
        var listItem = $(this); //<a>
        var button = listItem.parents('ul').prevAll('button'); //<button>
        button.find(".selected-label").text(listItem.text());
        button.val(listItem.data().value);
    }

    BootstrapTable.prototype.smartFilterAddRule = function (event) {
        var instance = event.data.instance;
        var modalBody = $(this).parents('.modal-body'); //<div>
        var selectedField = modalBody.find("#fields-list-button").data();
        var preOperatorValue = modalBody.find("#field-pre-operators-button").val();
        var operatorValue = modalBody.find("#field-operators-button").val();
        var filterValue = modalBody.find("#filter-value").val();
        var filterValueCase = modalBody.find("#filter-value-case").val();

        if (!selectedField.fieldName ||
            preOperatorValue == null ||
            (!operatorValue || operatorValue.length <= 0) ||
            (!filterValue || filterValue.length <= 0)) {
            console.error(instance.options.formatSmartFilterRuleNotComplete());
            alert(instance.options.formatSmartFilterRuleNotComplete());
            return false;
        }

        var filterRule = {
            field: buttonField.data().property,
            operator: buttonNegation.val() + ' ' + buttonOperator.val(),
            value: inputValue.val(),
            isCaseSensitive: buttonCaseSensitive.val().toLowerCase() == 'true' ? true : false
        };
        filterRule.description = element.data.options.filter_label_rule_fieldList + ' <span class="text-primary">' + filterRule.field + '</span> '
        filterRule.description += element.data.options.filter_label_rule_operator + ' <span class="text-primary">' + buttonNegation.text() + '</span>'
        filterRule.description += ' <span class="text-primary">' + buttonOperator.text() + '</span> '
        filterRule.description += element.data.options.filter_label_rule_value
        filterRule.description += ' <span class="text-primary">' + filterRule.value
        filterRule.description += filterRule.isCaseSensitive ? '  (' + element.data.options.filter_label_rule_casesensitive_is + ')' : '  (' + element.data.options.filter_label_rule_casesensitive_notis + ')</span>';

        if (element.data.helpers.data.filters) {
            var duplicateRule = $.grep(element.data.helpers.data.filters, function (item, index) {
                if (item.field == filterRule.field && item.operator == filterRule.operator && item.value == filterRule.value && item.isCaseSensitive == filterRule.isCaseSensitive) {
                    return true;
                } else {
                    return false;
                }
            });
            if (duplicateRule.length <= 0) {
                element.data.helpers.data.filters.push(filterRule);
            } else {
                alert(element.data.options.filter_label_error_ruleAlreadyExist);
            }
        } else {
            element.data.helpers.data.filters = [filterRule];
        }

        $.fn.repeater.views.filter.renderRules(element.data.helpers, element.data.options);
        return false;


    }
    //#endregion

    //#region "Template Functions"
    var smartFilterModalTemplate = function (instance) {
        return $('\
<div id="smart-filter-modal-'+ instance.$el[0].id + '"  class="modal fade" tabindex="-1" role="dialog">\
    <div class="modal-dialog modal-lg" role="document">\
        <div class="modal-content">\
            <div class="modal-header">\
                <button type="button" class="close" data-dismiss="modal">&times;</button>\
                <h4 class="modal-title">'+ instance.options.formatSmartFilterModalTitle() + '</h4>\
            </div>\
            <div class="modal-body bg-info">\
                <div class="row">\
                    <div class="col-md-12">\
                        <div class="input-group">\
                            <span class="input-group-btn">\
                                <button type="button" class="btn btn-info"><span class="glyphicon glyphicon-star"></span>&nbsp;' + instance.options.formatSmartFilterSaveButton() + '</button>\
                            </span>\
                            <input type="text" class="form-control smart-filter-view-manage-rules-rulename">\
                            <div class="input-group-btn">\
                                <button type="button" class="btn btn-info button-apply"><span class="glyphicon glyphicon-ok"></span>&nbsp; ' + instance.options.formatSmartFilterApplyButton() + '</button>\
                                <button type="button" class="btn btn-danger button-reset"><span class="glyphicon glyphicon-remove"></span>&nbsp; ' + instance.options.formatSmartFilterResetButton() + '</button>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="row" style="margin-top:10px;">\
                    <div class="col-md-12">\
                        <div class="pull-left dropdown">\
                            <label class="">' + instance.options.formatSmartFilterFieldListLabel() + ' </label>\
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" id="fields-list-button">\
                                <span class="selected-label">&nbsp; </span>\
                                <span class="caret"></span>\
                            </button>\
                            <ul class="dropdown-menu dropdown-menu-left" role="menu" id="fields-list">\
                            </ul>\
                        </div>\
                        <div class="pull-left dropdown">\
                            <label>&nbsp;' + instance.options.formatSmartFilterOperatorLabel() + ' </label>\
                            <div class="btn-group">\
                                <div class="btn-group">\
                                    <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" id="field-pre-operators-button">\
                                        <span class="selected-label">' + instance.options.formatSmartFilterOperatorIs() + '</span>\
                                        <span class="caret"></span>\
                                    </button>\
                                    <ul class="dropdown-menu dropdown-menu-left" role="menu" id="field-pre-operators">\
                                        <li><a href="#" data-value="">' + instance.options.formatSmartFilterOperatorIs() + '</a></li>\
                                        <li><a href="#" data-value="not">' + instance.options.formatSmartFilterOperatorNotIs() + '</a></li>\
                                    </ul>\
                                </div>\
                                <div class="btn-group">\
                                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" id="field-operators-button">\
                                        <span class="selected-label">&nbsp; </span>\
                                        <span class="caret"></span>\
                                    </button>\
                                    <ul class="dropdown-menu dropdown-menu-left" role="menu" id="field-operators">\
                                    </ul>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="pull-left dropdown">\
                            <label>&nbsp;' + instance.options.formatSmartFilterValueLabel() + ' </label>\
                            <div class="inline-container" id="filter-value-container">\
                                <input type="text" class="form-control pull-left" readonly />\
                            </div>\
                            &nbsp;\
                        </div>\
                        <div class="pull-left dropdown hidden" id="filter-value-case-container">\
                            <button type="button" class="btn btn-info dropdown-toggle" value="true" data-toggle="dropdown">\
                                <span class="selected-label">' + instance.options.formatSmartFilterCaseSensitive() + '</span>\
                                <span class="caret"></span>\
                            </button>\
                            <ul class="dropdown-menu dropdown-menu-left smart-filter-viewcasesensitive-list" role="menu" id="filter-value-case">\
                                <li><a href="#" data-value="true">' + instance.options.formatSmartFilterCaseSensitive() + '</a></li>\
                                <li><a href="#" data-value="false">' + instance.options.formatSmartFilterCaseInsensitive() + '</a></li>\
                            </ul>\
                        </div>\
                    </div>\
                </div>\
                <div class="row" style="margin-top:10px;">\
                    <div class="col-md-12">\
                        <div class="pull-right" id="filter-action-container">\
                            <button type="button" class="btn btn-success button-add"><span class="glyphicon glyphicon-plus"></span>&nbsp; ' + instance.options.formatSmartFilterAddButton() + '</button>\
                            &nbsp;\
                            <button type="button" class="btn btn-primary dropdown-toggle button-grouprule"><span class="glyphicon glyphicon-link"></span>&nbsp; ' + instance.options.formatSmartFilterGroupRulesButton() + '</button>\
                        </div>\
                    </div>\
                </div>\
                <div class="clearfix" data-resize="auto">\
                </div>\
            </div>\
        </div>\
    <div>\
</div>');
    }

    var smartFilterResetRuleButtons = function (templateElement) {
        var operatorButton = templateElement.parents('.modal-body').find('#field-operators-button'); //<button>
        operatorButton.find(".selected-label").text(" ");
        operatorButton.val("");
        operatorButton.removeClass('btn-info');
        operatorButton.addClass('btn-default');
        var inputContainer = templateElement.parents('.modal-body').find('#filter-value-container'); //<div>
        inputContainer.empty();
        inputContainer.append($('<input type="text" class="form-control pull-left" readonly />'));
    }

    var smartFilterLoadOperatorList = function (instance, listItem) {
        var field = listItem.data();
        var optionsList = listItem.parents('.modal-body').find('#field-operators'); //<ul>
        optionsList.empty();
        optionsList.append($('<li><a href="#" data-value="eq">' + instance.options.formatSmartFilterOperatorEqualsTo() + '</a></li>')); //always available

        if (field.fieldType.toLowerCase() === 'string') {
            optionsList.append($('<li><a href="#" data-value="contains">' + instance.options.formatSmartFilterOperatorContains() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="startswith">' + instance.options.formatSmartFilterOperatorStartsWith() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="endswith">' + instance.options.formatSmartFilterOperatorEndsWith() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="length">' + instance.options.formatSmartFilterOperatorLength() + '</a></li>'));
        }

        if (field.fieldType.toLowerCase() === 'number' || field.fieldType.toLowerCase() === 'date' || field.fieldType.toLowerCase() === 'datetime') {
            optionsList.append($('<li><a href="#" data-value="gt">' + instance.options.formatSmartFilterOperatorGreaterThan() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="ge">' + instance.options.formatSmartFilterOperatorGreaterThanOrEqualTo() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="lt">' + instance.options.formatSmartFilterOperatorLessThan() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="le">' + instance.options.formatSmartFilterOperatorLessThanOrEqualTo() + '</a></li>'));
        }

        if (field.fieldType.toLowerCase() === 'date' || field.fieldType.toLowerCase() === 'datetime') {
            optionsList.append($('<li><a href="#" data-value="year">' + instance.options.formatSmartFilterOperatorYearIs() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="month">' + instance.options.formatSmartFilterOperatorMonthIs() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="day">' + instance.options.formatSmartFilterOperatorDayIs() + '</a></li>'));
        }

        if (field.fieldType.toLowerCase() === 'time' || field.fieldType.toLowerCase() === 'datetime') {
            optionsList.append($('<li><a href="#" data-value="hour">' + instance.options.formatSmartFilterOperatorHourIs() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="minute">' + instance.options.formatSmartFilterOperatorMinuteIs() + '</a></li>'));
            optionsList.append($('<li><a href="#" data-value="second">' + instance.options.formatSmartFilterOperatorSecondIs() + '</a></li>'));
        }
    }

    var smartFilterRenderInputFieldValue = function (listItem) {
        var field = listItem.parents('.modal-body').find('#fields-list-button').data();
        var operator = listItem.data();
        var inputContainer = listItem.parents('.modal-body').find('#filter-value-container'); //<ul>
        inputContainer.empty();
        var valueCaseContainer = listItem.parents('.modal-body').find('#filter-value-case-container');
        valueCaseContainer.addClass('hidden');

        if (field.fieldType === 'string' && operator.value !== 'length') {
            inputContainer.append($('<input type="text" class="form-control pull-left" id="filter-value">'));
            valueCaseContainer.removeClass('hidden');
        } else if (field.fieldType === 'number' || operator.value === 'length'
            || operator.value === 'year' || operator.value === 'month' || operator.value === 'day'
            || operator.value === 'hour' || operator.value === 'minute' || operator.value === 'second') {
            var input = $('<input type="number" class="form-control pull-left" id="filter-value"/>');
            switch (operator.value) {
                case "year":
                    input.attr("min", 1970);
                    input.attr("max", 2100);
                    break;
                case "month":
                    input.attr("min", 1);
                    input.attr("max", 12);
                    break;
                case "day":
                    input.attr("min", 1);
                    input.attr("max", 31);
                    break;
                case "hour":
                    input.attr("min", 0);
                    input.attr("max", 23);
                    break;
                case "minute":
                    input.attr("min", 0);
                    input.attr("max", 59);
                    break;
                case "second":
                    input.attr("min", 0);
                    input.attr("max", 59);
                    break;
            }
            inputContainer.append(input);
        } else if (field.fieldType === 'date') {
            inputContainer.append($('<input type="date" class="form-control pull-left" id="filter-value">'));
        } else if (field.fieldType === 'time') {
            inputContainer.append($('<input type="time" class="form-control pull-left" id="filter-value">'));
        } else if (field.fieldType === 'datetime') {
            inputContainer.append($('<input type="datetime" class="form-control pull-left" id="filter-value">'));
        }
    }

    //#endregion

})(jQuery);    
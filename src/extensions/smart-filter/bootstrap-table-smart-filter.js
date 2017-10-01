/**
 * @author: Michael Sogos <michael.sogos@gurustudioweb.it>
 * @version: v1.0.1 
 */

(function ($) {
    'use strict';
    var sprintf = $.fn.bootstrapTable.utils.sprintf;

    //#region "Add to bootstrap-table configurations"
    $.extend($.fn.bootstrapTable.defaults, {
        smartFilter: false,
        smartFilterEnableSaveQuery: false
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
        formatSmartFilterOperandAnd: function () { return 'and' },
        formatSmartFilterOperandOr: function () { return 'or' },
        formatSmartFilterRuleNotComplete: function () { return 'Please, complete the rule before add it!' },
        formatSmartFilterErrorRuleAlreadyExist: function () { return 'This rule already exist!' },
        formatSmartFilterSelectMoreRulesToGroup: function () { return 'Select two or more rules!' },
        formatSmartFilterNotSequentialSelectioc: function () { return 'Please, select items sequentially !' },
        formatSmartFilterEmptyRulesContainer: function () { return 'No rules has been configured yet' },
        filter_label_temporaryFilter: 'building filter ...',
        filter_label_error_emptyFilterName: 'Please, specify a name for the filter!',
        filter_label_error_ruleNameAlreadyUsed: 'A rule with this name already exist!',
        filter_label_error_noRule: 'Please, compose at least one rule!'
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
                if (!item.field || !item.fieldType) return true;
                var dataField = $('<a href="#"></a>').data({ fieldName: item.field, fieldLabel: item.title, fieldType: item.fieldType }).html(item.title);
                var listItem = $('<li>').append(dataField);
                template.find('#fields-list').append(listItem);
            });

            //register events
            template.find('#fields-list').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldsListChanged);
            template.find('#field-pre-operators').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldPerOperatorsChanged);
            template.find('#field-operators').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldOperatorsChanged);
            template.find('#filter-value-case').on('click', 'li a', { instance: this }, BootstrapTable.prototype.smartFilterFieldValueCaseChanged);
            template.find('#filter-action-add').on('click', { instance: this }, BootstrapTable.prototype.smartFilterAddRule);
            template.find('#filter-action-grouprule').on('click', { instance: this }, BootstrapTable.prototype.smartFilterAddGroupRule);
            template.find('#filter-action-clear').on('click', { instance: this }, BootstrapTable.prototype.smartFilterClearRules);

            $('body').append(template);

            smartFilterRenderRules(this);
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
        var preOperatorButton = modalBody.find("#field-pre-operators-button");
        var preOperatorValue = preOperatorButton.val();
        var preOperatorText = preOperatorButton.text();
        var operatorButton = modalBody.find("#field-operators-button");
        var operatorValue = operatorButton.val();
        var operatorText = operatorButton.text();
        var filterValue = modalBody.find("#filter-value").val();
        var filterValueCase = modalBody.find("#filter-value-case-button").val();

        if (!selectedField.fieldName ||
            preOperatorValue == null ||
            (!operatorValue || operatorValue.length <= 0) ||
            (!filterValue || filterValue.length <= 0)) {
            console.error(instance.options.formatSmartFilterRuleNotComplete());
            alert(instance.options.formatSmartFilterRuleNotComplete());
            return false;
        }

        var filterRule = {
            field: selectedField.fieldName,
            operator: (preOperatorValue.length > 0 ? preOperatorValue + ' ' : '') + operatorValue,
            value: filterValue,
            isCaseSensitive: filterValueCase.toLowerCase() == 'true' ? true : false
        };

        filterRule.description = instance.options.formatSmartFilterFieldListLabel() + ' <span class="text-primary">' + selectedField.fieldLabel + '</span> '
        filterRule.description += instance.options.formatSmartFilterOperatorLabel() + ' <span class="text-primary">' + preOperatorText + '</span>'
        filterRule.description += ' <span class="text-primary">' + operatorText + '</span> '
        filterRule.description += instance.options.formatSmartFilterValueLabel()
        filterRule.description += ' <span class="text-primary">' + filterRule.value
        filterRule.description += filterRule.isCaseSensitive ? '  (' + instance.options.formatSmartFilterCaseSensitive() + ')' : '  (' + instance.options.formatSmartFilterCaseInsensitive() + ')</span>';

        if (instance.options.smartFilterData) {
            var duplicateRule = $.grep(instance.options.smartFilterData, function (item, index) {
                if (item.field == filterRule.field && item.operator == filterRule.operator && item.value == filterRule.value && item.isCaseSensitive == filterRule.isCaseSensitive) {
                    return true;
                } else {
                    return false;
                }
            });

            if (duplicateRule.length <= 0) {
                instance.options.smartFilterData.push(filterRule);
            } else {
                alert(instance.options.formatSmartFilterErrorRuleAlreadyExist());
            }
        }
        else {
            instance.options.smartFilterData = [filterRule];
        }

        if (instance.options.smartFilterData.length > 1)
            $('#filter-action-grouprule').removeAttr("disabled");

        smartFilterRenderRules(instance);

        return false;
    }

    BootstrapTable.prototype.smartFilterSelectRule = function (event) {
        var instance = event.data.instance;
        var parent = $(this).parent();
        var ruleIndex = parseInt(parent.find('.button-remove').val());

        if (!instance.options._smartFilterSelectedRules) instance.options._smartFilterSelectedRules = [];

        if (parent.hasClass('selected')) {
            var index = instance.options._smartFilterSelectedRules.indexOf(ruleIndex);
            instance.options._smartFilterSelectedRules.splice(index, 1);
        }
        else {
            instance.options._smartFilterSelectedRules.push(ruleIndex);
        }

        instance.options._smartFilterSelectedRules.sort();

        parent.toggleClass('selected');
    }

    BootstrapTable.prototype.smartFilterRemoveRule = function (event) {
        var instance = event.data.instance;
        var ruleIndex = parseInt($(this).val());
        if (instance.options.smartFilterData[ruleIndex].isGrouped) {
            BootstrapTable.prototype.smartFilterCancelGroup(instance, ruleIndex);
        }
        instance.options.smartFilterData.splice(ruleIndex, 1);
        smartFilterRenderRules(instance);
    }

    BootstrapTable.prototype.smartFilterToogleAndOr = function (element) {
        var self = $(this);
        if (self.val() == 'and') {
            self.text(element.data.options.filter_label_rule_or);
            self.val('or');
        } else {
            self.text(element.data.options.filter_label_rule_and);
            self.val('and');
        }

        var buttonRemove = self.closest('div').find('.button-remove');
        var ruleIndex = parseInt(buttonRemove.val());

        element.data.helpers.data.filters[ruleIndex].condition = self.val();

        return false;
    }

    BootstrapTable.prototype.smartFilterCancelGroup = function (instance, index) {
        if (element.data.helpers.data.filters[index] && element.data.helpers.data.filters[index].isGrouped) {
            element.data.helpers.data.filters[index].isGrouped = false;
            if (index > 0) $.fn.repeater.views.filter.cancelGroup(element, index - 1);
            $.fn.repeater.views.filter.cancelGroup(element, index + 1);
        }
    }

    BootstrapTable.prototype.smartFilterAddGroupRule = function (event) {
        var instance = event.data.instance;

        if (!instance.options._smartFilterSelectedRules || instance.options._smartFilterSelectedRules.length <= 1) {
            console.error(instance.options.formatSmartFilterSelectMoreRulesToGroup());
            alert(instance.options.formatSmartFilterSelectMoreRulesToGroup());
            return false;
        }

        var isSequentialSelection = true;
        for (var i = 1; i < instance.options._smartFilterSelectedRules.length; i++) {
            if (instance.options._smartFilterSelectedRules[i] - instance.options._smartFilterSelectedRules[i - 1] != 1) {
                isSequentialSelection = false;
                break;
            }
        }

        if (!isSequentialSelection) {
            console.error(instance.options.formatSmartFilterNotSequentialSelection());
            alert(instance.options.formatSmartFilterNotSequentialSelection());
            return false;
        }

        $.each(instance.options._smartFilterSelectedRules, function (index, item) {
            instance.options.smartFilterData[item].isGrouped = true;
        });

        smartFilterRenderRules(instance);
    }

    BootstrapTable.prototype.smartFilterClearRules = function (event) {
        var instance = event.data.instance;
        instance.options.smartFilterData = [];
        instance.options._smartFilterSelectedRules = [];
        smartFilterRenderRules(instance);
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
            <div class="modal-body">' + (instance.options.smartFilterEnableSaveQuery ? '<div class="row">\
                    <div class="col-md-12">\
                        <div class="input-group">\
                            <span class="input-group-btn">\
                                <button type="button" class="btn btn-info"><span class="glyphicon glyphicon-star"></span>&nbsp;' + instance.options.formatSmartFilterSaveButton() + '</button>\
                            </span>\
                            <input type="text" class="form-control smart-filter-view-manage-rules-rulename">\
                            <div class="input-group-btn">\
                                <button type="button" class="btn btn-info"><span class="glyphicon glyphicon-ok"></span>&nbsp; ' + instance.options.formatSmartFilterApplyButton() + '</button>\
                                <button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span>&nbsp; ' + instance.options.formatSmartFilterResetButton() + '</button>\
                            </div>\
                        </div>\
                    </div>\
                </div>' : '') + '<div class="row" style="margin-top:10px;">\
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
                            <button type="button" class="btn btn-info dropdown-toggle" value="true" data-toggle="dropdown" id="filter-value-case-button">\
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
                        <div class="btn-group" id="filter-action-container">\
                            <button type="button" class="btn btn-success" id="filter-action-add"><span class="glyphicon glyphicon-plus"></span>' + instance.options.formatSmartFilterAddButton() + '</button>\
                            <button type="button" class="btn btn-success" id="filter-action-grouprule" disabled="disabled"><span class="glyphicon glyphicon-link"></span>' + instance.options.formatSmartFilterGroupRulesButton() + '</button>\
                            <button type="button" class="btn btn-danger" id="filter-action-clear" ><span class="glyphicon glyphicon-remove"></span>' + instance.options.formatSmartFilterResetButton() + '</button>\
                        </div>\
                    </div>\
                </div>\
                <div class="row">\
                    <div class="col-md-12 well" id="filter-rules-container" >\
                    </div>\
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

    var smartFilterRenderRules = function (instance) {
        var rulesContainer = $('#filter-rules-container');
        rulesContainer.empty();

        if (instance.options.smartFilterData == null) instance.options.smartFilterData = [];
        if (instance.options.smartFilterData.length <= 0)
            rulesContainer.append($('<p>' + instance.options.formatSmartFilterEmptyRulesContainer() + '</p>'));

        $.each(instance.options.smartFilterData, function (index, item) {
            var ruleDescription = $('<div class="smart-filter-rule "></div>');
            var postRuleDescription = null;

            if (item.isGrouped) {
                ruleDescription.addClass("grouped");
                if (index == 0 || !instance.options.smartFilterData[index - 1].isGrouped) rulesContainer.append('<span class="text-primary">REMOVE GROUP LINK</span>');
                //if (instance.options.smartFilterData.length - 1 == index || !instance.options.smartFilterData[index + 1].isGrouped) postRuleDescription = $('<h3 class="text-primary">]</h3>');
            }

            var ruleText = $('<span class="help-block">' + item.description + '</span>');
            ruleText.on('click', { instance: instance }, BootstrapTable.prototype.smartFilterSelectRule);
            if (index != instance.options.smartFilterData.length - 1) {
                var ruleAndOrOption = $('<button type="button" class="btn btn-info" value="and"></button>');
                ruleAndOrOption.on('click', { instance: instance }, BootstrapTable.prototype.smartFilterToogleAndOr);
                ruleAndOrOption.text(instance.options.formatSmartFilterOperandAnd());
                ruleText.append(ruleAndOrOption);
            }

            var rulesAction = $('<button type="button" class="btn btn-warning pull-right button-remove" value="' + index + '"><span class="glyphicon glyphicon-minus"></span>&nbsp;Remove</button>');
            rulesAction.on('click', { instance: instance }, BootstrapTable.prototype.smartFilterRemoveRule);
            ruleDescription.append(rulesAction);


            ruleDescription.append(ruleText);
            rulesContainer.append(ruleDescription);
            if (postRuleDescription) rulesContainer.append(postRuleDescription);
        });

    }

    //#endregion

})(jQuery);    
/*
 * 자바스크립트 공통 모듈입니다.
 */
var cj = (function(Cookies) {

    var isReloadFirst = true;
    var combo_nm = "";

    return {
        /**
         * 검색조건 항목에서
         *    1. Text Input Box에서 엔터를 누를 때,
         *    2. Check Box, Radio Button, Select Box가 변경될 때
         * 동작할 기본 동작을 지정합니다.
         */
        setSearchFieldDefaultAction : function($searchElement, callbackName, excludeList) {
            if ($searchElement == null)
                $searchElement = $(".searchArea");

            if (callbackName == null)
                callbackName = "doSearch";

            $searchElement.find(":text").on("keydown", $searchElement, function(event) {
                if (event.which == 13 || event.keyCode == 13) {
                    eval(callbackName + "()");
                }
            });

            /*$searchElement.find("select, :checkbox, :radio").on("change", $searchElement, function(event) {
                if (excludeList == null) {
                    eval(callbackName + "()");
                } else if ($.inArray($(this).prop("id"), excludeList) == -1) {
                    eval(callbackName + "()");
                }
            });*/
        },

        /**
         * 검색조건을 저장합니다.
         */
        saveSearchInfos : function(key, $jqGrid, $searchElement) {
            var params = [];

            if ($searchElement == null)
                $searchElement = $(".searchArea");

            $searchElement.find(":text").each(function(index) {
                var val = $.trim($(this).val());
                params.push("text=" + $(this).attr("name") + "=" + escape(val));
            });

            $searchElement.find("text:hidden").each(function(index) {
                var val = $.trim($(this).val());
                params.push("hidden=" + $(this).attr("name") + "=" + escape(val));
            });

            $searchElement.find("select").each( function(index) {
                var val = $.trim($(this).val());
                params.push("select=" + $(this).attr("name") + "=" + escape(val));
            });

            $searchElement.find("input[type=radio]:checked").each(function(index) {
                var val = $.trim($(this).val());
                params.push("radio=" + $(this).attr("name") + "=" + escape(val));
            });

            var checkboxNames = [];
            $searchElement.find("input[type=checkbox]").each(function(index) {
                var name = $(this).attr("name");
                if ($.inArray(name, checkboxNames) < 0) {
                    checkboxNames.push(name)
                }
            });

            for (var i = 0; i < checkboxNames.length; i++) {
                var values = [];
                $(":checkbox[name=" + checkboxNames[i] + "]:checked").each(function() {
                    values.push($(this).val());
                });

                params.push("checkbox=" + checkboxNames[i] + "=" + escape(values.join(",")));
            }

            // jqGrid 옵션 처리
            if ($jqGrid != null && $jqGrid.length > 0) {
                var jqGridID = $jqGrid.prop("id");
                sessionStorage["jqGrid:" + key + ":" + jqGridID + ":page"]      = $jqGrid.jqGrid("getGridParam", "page");
                sessionStorage["jqGrid:" + key + ":" + jqGridID + ":rowNum"]    = $jqGrid.jqGrid("getGridParam", "rowNum");
                sessionStorage["jqGrid:" + key + ":" + jqGridID + ":sortname"]  = $jqGrid.jqGrid("getGridParam", "sortname");
                sessionStorage["jqGrid:" + key + ":" + jqGridID + ":sortorder"] = $jqGrid.jqGrid("getGridParam", "sortorder");
            }

            sessionStorage["SSK:" + key] = params.join(',');
        },

        /**
         * 검색조건을 복구합니다.
         */
        reloadSearchInfos : function(key, $searchElement) {
            var url = self.location.href;
            if ($.trim(url).toLowerCase().indexOf("reloadsearch=true") < 0)
                return;

            if ($searchElement == null)
                $searchElement = $(".searchArea");

            var searchInfos = sessionStorage["SSK:" + key];
            if (typeof searchInfos == "undefined" || searchInfos == null)
                return;

            var params = searchInfos.split(',');

            for (var i = 0; i < params.length; i++) {
                var keyValue = params[i].split('=');

                switch (keyValue[0]) {
                    case "text":
                        $searchElement.find(":text[name=" + keyValue[1] + "]").val(unescape(keyValue[2]));
                        break;
                    case "hidden":
                        $searchElement.find(":hidden[name=" + keyValue[1] + "]").val(unescape(keyValue[2]));
                        break;
                    case "select":
                        $searchElement.find("select[name='" + keyValue[1] + "']").val(unescape(keyValue[2]));
                        break;
                    case "radio":
                        $searchElement.find(":radio[name='" + keyValue[1] + "'][value='" + unescape(keyValue[2]) + "']").prop("checked", true);
                        break;
                    case "checkbox":
                        $searchElement.find(":checkbox[name='" + keyValue[1] + "'][value='" + unescape(keyValue[2]) + "']").prop("checked", true);
                        break;
                    default:
                        break;
                }
            }
        },

        /**
         * 저장됐던 jqGrid의 Page검색조건을 복구합니다.
         */
        getGridPage : function(key, $jqGrid, defaultValue) {
            if ($.trim(self.location.href).toLowerCase().indexOf("reloadsearch=true") < 0) {
                return defaultValue;
            } else {
                if (isReloadFirst) {
                    isReloadFirst = false;
                    return sessionStorage["jqGrid:" + key + ":" + $jqGrid.prop("id") + ":page"];
                } else {
                    return defaultValue;
                }
            }
        },

        /**
         * 저장됐던 jqGrid의 rowNum 검색조건을 복구합니다.
         */
        getGridRowNum : function(key, $jqGrid, defaultValue) {
            if ($.trim(self.location.href).toLowerCase().indexOf("reloadsearch=true") < 0)
                return defaultValue;
            else
                return sessionStorage["jqGrid:" + key + ":"+ $jqGrid.prop("id") + ":rowNum"];
        },

        /**
         * 저장됐던 jqGrid의 sortname 검색조건을 복구합니다.
         */
        getGridSortName : function(key, $jqGrid, defaultValue) {
            if ($.trim(self.location.href).toLowerCase().indexOf("reloadsearch=true") < 0)
                return defaultValue;
            else
                return sessionStorage["jqGrid:" + key + ":"+ $jqGrid.prop("id") + ":sortname"];
        },

        /**
         * 저장됐던 jqGrid의 sortorder 검색조건을 복구합니다.
         */
        getGridSortOrder : function(key, $jqGrid, defaultValue) {
            if ($.trim(self.location.href).toLowerCase().indexOf("reloadsearch=true") < 0)
                return defaultValue;
            else
                return sessionStorage["jqGrid:" + key + ":" + $jqGrid.prop("id") + ":sortorder"];
        },

        /**
         * 검색된 데이터가 존재하지 않을 경우 메세지를 출력합니다.
         */
        setGridEmptyMessage : function($jqGrid, message, height) {
            var gridId = $jqGrid.prop("id");
            if (parseInt($("#sp_1_" + gridId + "-pager").text(), 10) == 0) {
                if (height != null) {
                    $("#gbox_" + gridId + " .ui-jqgrid-bdiv > div > div").html("<div class=\"jqgrid-empty-box\" style=\"height:" + height + "px;padding-top:" + (height / 2 - 10) + "px;\">" + message + "</div>");
                } else {
                    $("#gbox_" + gridId + " .ui-jqgrid-bdiv > div > div").html("<div class=\"jqgrid-empty-box\">" + message + "</div>");
                }
            } else {
                $("#gbox_" + gridId + " .ui-jqgrid-bdiv > div > div").html("");
            }

            $(".frozen-sdiv").css("display", "none");
        },

        /**
         * 로그인 오류 메시지를 출력합니다.
         */
        checkLoginMessage : function() {
            setTimeout(function() {
                var _LFCD_ = $.cookie("_LFCD_");
                var _LFMSG_ = $.cookie("_LFMSG_");

                if (_LFCD_ == "YSRND" || _LFCD_ == "YRI" || _LFCD_ == "YSRIM") {
                    alert(_LFMSG_ + "\n\n");
                }

                if (self.location.href.indexOf("localhost") > -1) {
                    $.cookie("_LFCD_",  null, { path : "/" });
                    $.cookie("_LFMSG_", null, { path : "/" });
                } else {
                    $.cookie("_LFCD_",  null, { path : "/", domain : ".cj.ac.kr" });
                    $.cookie("_LFMSG_", null, { path : "/", domain : ".cj.ac.kr" });
                }
            }, 300);
        },

        /**
         * 처리 중 대화 상자를 출력합니다.
         */
        showWating: function() {
            var $wating = $("#div-cmn-wating");
            if ($wating.length == 0) {
                var html = "<div id=\"div-cmn-wating-bg\">&nbsp;</div><div id=\"div-cmn-wating\"></div>";
                $("body").append(html);
            }

            var isPopup = $("body").hasClass("popup");
            var wWidth  = 0;
            var wHeight = 0;
            if (isPopup) {
                wWidth  = $("#cont").width()  + 40;
                wHeight = $("#cont").height() + 80;
            } else {
                wWidth  = $("#cont").width()  + 20;
                wHeight = $("#cont").height() + 30;
            }

            if (wHeight < $(window).height()) {
                wHeight = $(window).height();
            }

            $("#div-cmn-wating-bg, #div-cmn-wating").css({
                display: "block",
                width: wWidth + "px",
                height: wHeight + "px"
            });

            var imgTop = parseInt((parseInt($(window).height(), 10) - 110) /2) - 20;
            if (!isPopup) {
                imgTop = imgTop - 100;
            }
            $("#div-cmn-wating").html("<img src=\"/image/ysrim/loading.gif?"+ Math.random() + "\" class=\"wating\" style=\"margin-top:" + imgTop + "px\" />");
        },

        /**
         * 처리 중 대화 상자를 닫습니다.
         */
        hideWating: function() {
            $("#div-cmn-wating-bg, #div-cmn-wating").css("display", "none");
        },

        /**
         * URL을 링크로 대체합니다.
         */
        replaceURLWithLinks : function(src) {
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
            return src.replace(exp, "<a href='$1' target='_blank'>$1</a>");
        },

        /**
         * 이메일 주소를 링크로 대체합니다.
         */
        replaceEmailWithLinks : function(src) {
            var exp = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;
            return src.replace(exp, "<a href='mailto:$1'>$1</a>");
        },

        /**
         * 달력 컨트롤 설정
         */
        setDatePicker : function(source) {
            /*var langCd = $.cookie("_YSRND_LANGUAGE_");
            if (langCd == "EN") {
                $(source).datepicker({
                    inline : true,
                    dateFormat : 'yy-mm-dd',
                    showMonthAfterYear : true
                }).inputmask("yyyy-mm-dd", { "placeholder" : "yyyy-mm-dd", "clearIncomplete" : true });
            } else {*/
            $(source).datepicker({
                inline : true,
                dateFormat : 'yy-mm-dd',
                prevText : '이전 달',
                nextText : '다음 달',
                monthNames : [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ],
                monthNamesShort : [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ],
                dayNames : [ '일', '월', '화', '수', '목', '금', '토' ],
                dayNamesShort : [ '일', '월', '화', '수', '목', '금', '토' ],
                dayNamesMin : [ '일', '월', '화', '수', '목', '금', '토' ],
                showMonthAfterYear : true,
                yearSuffix : '년'
            }).inputmask("yyyy-mm-dd", { "placeholder" : "yyyy-mm-dd", "clearIncomplete" : true });
            //}
        },

        setMonthPicker : function(id) {

            var currentYear = (new Date()).getFullYear();
            var startYear = currentYear - 10;
            var finalYear = currentYear + 10;

            var options = {
                selectedYear: currentYear,
                startYear: startYear,
                finalYear: finalYear,
                pattern: 'yyyy-mm',
                monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
            };

            $('#' + id).monthpicker(options);
        },

        /* 업로드 파일 타입 체크 일반파일용 */
        fileCheck : function(targetFile, file_value) {
            var files = targetFile;
            var for_mat = "\.(txt|pdf|doc|docx|xls|xlsx|ppt|pptx|hwp|gif|jpg|png|zip)$";
            var return_flag = true;

            if (!!window.FileReader) {
                // FILE API 지원 브라우저
                for (var i = 0; i < files.length; i++) {
                    var f = files[i];

                    if (f.size > 20971520 || f.fileSize > 20971520) /*파일 크기 20971520 체크 */ {
                        alert("파일 크기가 20MB를 초과합니다.");
                        return_flag = false;
                    }
                }
            }

            for (var i = 0; i < files.length; i++) {
                if (!(new RegExp(for_mat, "i")).test(file_value)) {
                    alert("업로드를 지원하지 않는 형식의 파일입니다.\n\n(지원형식: .txt, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .hwp, .gif, .jpg, .png, .zip)");
                    return_flag = false;
                }
            }

            return return_flag;
        },

        /* 업로드 파일 타입 체크 이미지용 */
        imgCheck : function(targetFile, file_value) {
            var files = targetFile;
            var for_mat = "\.(gif|jpg|png)$";
            var return_flag = true;

            for (var i = 0; i < files.length; i++) {
                if (!(new RegExp(for_mat, "i")).test(file_value)) {
                    alert("이미지 파일만 업로드 하실 수 있습니다.\n\n(지원형식: .gif, .jpg, .png)");
                    return_flag = false;
                }
            }

            return return_flag;
        },

        // NULL 체크
        getNullChk : function(id, nm) {
            var val = "";
            if ($('#' + id) != null && $('#' + id).val() != "") {
                val = $('#' + id).val().replace(/^\s+|\s+$/g, '');
            }

            if (val == "") {
                if ($('#' + id).attr("type") == "text" || $('#' + id).get(0).tagName.toLowerCase() == "textarea") {
                    alert(nm + " 입력해주십시오.");
                } else if ($('#' + id).type == "file") {
                    alert(nm + " 등록해주십시오.");
                } else {
                    alert(nm + " 선택해주십시오.");
                }

                if ($('#' + id).type != "hidden") {
                    $('#' + id).focus();
                } else if ($('#' + id + "1") != null) {
                    $('#' + id + "1").focus();
                }
                return false;
            }
            return true;
        },

        // 바이트체크
        fnGetByte : function(str) {
            var mByte = 0;

            if (str != null) {
                for (var i = 0; i < str.length; i++) {
                    var ch1 = str.substring(i, i + 1);
                    var ch2 = str.substring(i, i + 2);
                    var en1 = escape(ch1);
                    var en2 = escape(ch2);
                    if (en2 == "%0D%0A") {
                        i++;
                        mByte++;

                    } else {
                        if (en1.length <= 4) {
                            mByte++;
                        } else {
                            mByte += 2;
                        }
                    }
                }
            }

            return mByte;
        },

        // 달력생성
        initCal : function(start_year, desc) {
            var now = new Date();
            var year_text = "";

            if (desc != null)
                year_text += "<option value=''>" + desc + "</option>";

            for (var i = 0; i < Number(now.getFullYear()) - start_year; i++) {
                year_text += "<option value='" + (Number(now.getFullYear()) - i) + "'>" + (Number(now.getFullYear()) - i) + "</option>";
            }

            return year_text;
        },

        // 달력생성 + 1
        initCals : function(start_year, desc) {
            var now = new Date();
            var year_text = "";

            if (desc != null)
                year_text += "<option value=''>" + desc + "</option>";

            for (var i = 0; i < Number(now.getFullYear() + 1) - start_year; i++) {
                year_text += "<option value='"
                    + (Number(now.getFullYear() + 1) - i) + "'>"
                    + (Number(now.getFullYear() + 1) - i) + "</option>";
            }

            return year_text;
        },

        // 달력생성
        initCal_this : function(this_year) {
            var year_text = "<option value='" + this_year + "'>" + this_year + "</option>";
            return year_text;
        },

        // 팝업 출력
        popup : function(url, name, options) {
            var isEmptyOption = this.isNull(options);

            var width      = (isEmptyOption || this.isNull(options.width)) ? parseInt(screen.width * 0.4, 10) : options.width;
            var height     = (isEmptyOption || this.isNull(options.height)) ? parseInt(screen.height * 0.6, 10) : options.height;
            var top        = (isEmptyOption || this.isNull(options.top)) ? parseInt((screen.height - height) / 3, 10) : options.top;
            var left       = (isEmptyOption || this.isNull(options.left)) ? parseInt((screen.width - width) / 2, 10) : options.left;

            var menubar    = (isEmptyOption || this.isNull(options.menubar)) ? "no" : options.menubar;
            var resizable  = (isEmptyOption || this.isNull(options.resizable)) ? "no" : options.resizable;
            var scrollbars = (isEmptyOption || this.isNull(options.scrollbars)) ? "yes" : options.scrollbars;
            var status     = (isEmptyOption || this.isNull(options.status)) ? "no" : options.status;
            var titlebar   = (isEmptyOption || this.isNull(options.titlebar)) ? "no" : options.titlebar;
            var toolbar    = (isEmptyOption || this.isNull(options.toolbar)) ? "no" : options.toolbar;
            var opencheck  = (isEmptyOption || this.isNull(options.opencheck)) ? true : options.opencheck;

            var optionStr = "top=" + top + ",left=" + left + ",width=" + width + ",height=" + height + ",menubar=" + menubar + ",resizable=" + resizable + ",scrollbars=" + scrollbars + ",status=" + status + ",titlebar=" + titlebar + ",toolbar" + toolbar;
            var objWindow = window.open(url, name, optionStr);
            if (objWindow) {
                objWindow.focus();
            } else {
                if (opencheck)
                    alert("웹 브라우저의 팝업 차단을 해제하여 주십시요.");
            }

            return objWindow;
        },

        // NULL 여부 체크
        isNull : function(value) {
            return (typeof value == "undefined" || value == null);
        },

        autoHypenPhone : function(str) {
            if (str == "" || str == null)
                return "";

            str = str.replace(/[^0-9]/g, "");
            if (str.length < 4)
                return str;

            var DataForm = "";
            var RegPhonNum = "";

            if (str.substring(0, 2) == "02" && str.length > 10) {
                str = str.substring(0, 10);
            }

            if (str.length > 3 && str.length < 7) {
                if (str.substring(0, 2) == "02") {
                    DataForm = "$1-$2";
                    RegPhonNum = /([0-9]{2})([0-9]+)/;
                } else {
                    DataForm = "$1-$2";
                    RegPhonNum = /([0-9]{3})([0-9]+)/;
                }
            } else if (str.length == 7) {
                if (str.substring(0, 2) == "02") {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{2})([0-9]{3})([0-9]+)/;
                } else {
                    DataForm = "$1-$2";
                    RegPhonNum = /([0-9]{3})([0-9]{4})/;
                }
            } else if (str.length == 9) {
                if (str.substring(0, 2) == "02") {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{2})([0-9]{3})([0-9]+)/;
                } else {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{3})([0-9]{3})([0-9]+)/;
                }
            } else if (str.length == 10) {
                if (str.substring(0, 2) == "02") {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{2})([0-9]{4})([0-9]+)/;
                } else {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{3})([0-9]{3})([0-9]+)/;
                }
            } else if (str.length > 10) {
                if (str.substring(0, 2) == "02") {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{2})([0-9]{4})([0-9]+)/;
                } else {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{3})([0-9]{4})([0-9]+)/;
                }
            } else {
                if (str.substring(0, 2) == "02") {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{2})([0-9]{3})([0-9]+)/;
                } else {
                    DataForm = "$1-$2-$3";
                    RegPhonNum = /([0-9]{3})([0-9]{3})([0-9]+)/;
                }
            }

            while (RegPhonNum.test(str)) {
                str = str.replace(RegPhonNum, DataForm);
            }

            return str;
        },

        addComma : function(source) {
            var reg = /(^[+-]?\d+)(\d{3})/;
            var n = (source + "");

            while (reg.test(n)) n = n.replace(reg, "$1" + "," + "$2");

            return n;
        },

        // Check Email Format
        checkEmail : function(email) {
            var email_pat = /^([a-zA-Z0-9-_.]{3,})@([a-zA-Z0-9_-]{3,})\.([a-zA-Z]{2,}$|[a-zA-Z]{2,}\.[a-zA-Z]{2,}$)/g;
            if ((email == '') || (email_pat.test(email) != true))
                return false;
            return true;
        },

        setCombo : function(combo) {
            combo_nm = combo;
        },

        combo : function(data, key, default_yn, selected, code2, disabled, id_name_yn) {
            var result = '<select id="' + key + '" name="' + key + '" ' + (disabled == "Y" ? 'disabled=disabled' : "") + '">';

            if(default_yn == "Y") {
                result += '<option selected="selected" value="">' + (combo_nm != "" ? combo_nm : "select") + '</option>';
            }

            if(data != null) {
                $(data.SQL_RESULT).each(function (i, mes) {
                    var title = '';
                    if(code2 == "Y") {
                        title = 'title="' + mes.CD_ID2 + '"';
                    }

                    result += '<option value="' + mes.CD_ID + '" ' + (selected != "" ? (selected == mes.CD_ID ? 'selected="selected"' : '') : '') + ' ' + title + '>' + (id_name_yn == "Y" ? mes.CD_ID+" (" : "") +mes.CD_NM + (id_name_yn == "Y" ? ")" : "") + '</option>';
                });
            }

            result += '</select>';

            return result;
        },

        checkbox : function(data, key, cheked, disabled, id_name_yn){
            var result;
            var obj;
            if(data != null) {

                $(data.SQL_RESULT).each(function (i, mes) {
                    obj = '<input type="checkbox" name="'+key+'" value="' + mes.CD_ID + '" ' + (disabled == "Y" ? 'disabled=disabled' : "") + (cheked != "" ? (cheked == mes.CD_ID ? 'cheked="cheked"' : '') : '') + ' />' +
                        '<label for="'+key+'_'+mes.CD_ID+'">'+
                        (id_name_yn == "Y" ? mes.CD_ID+" (" : "") +mes.CD_NM + (id_name_yn == "Y" ? ")" : "")+
                        '</label>';
                    if(i == 0)
                    {
                        result = obj;
                    }
                    else
                    {
                        result += obj;
                    }
                });
            }
            return result;
        },

        selectbox : function(data, default_yn) {
            var result = "";

            if(default_yn == "Y") {
                result += "'':select;";
            }

            if(data != null) {
                $(data.SQL_RESULT).each(function (i, mes) {
                    result += mes.CD_ID + ":" + mes.CD_NM + ";";
                });
            }

            //마지막 문자열 제거
            result.slice(0, -1);

            return result.slice(0, -1);
        },

        toString : function(data) {
            var code = '';
            var name = '';

            if(data != null) {
                $(data.SQL_RESULT).each(function (i, mes) {
                    code += mes.CD_ID + ",";
                    name += mes.CD_NM + ",";
                });
            }

            //마지막 문자열 제거
            code.slice(0, -1);
            name.slice(0, -1);

            return code + "|" + name;
        },

        subString : function(str, size) {

            var return_str = "";
            if(str.length > size) {
                return_str = str.substring(0, size) + "...";
            } else {
                return_str = str;
            }

            return return_str;
        },

        tooltip : function(title, message, size) {
            $("#tooltip").attr("title", title);
            $("#tooltip").show();

            var tit = "";
            if(title.length > size) {
                tit = title.substring(0, size) + "...";
            } else {
                tit = title;
            }

            $("#tooltipMsg").html(tit);
            $("#TMS_MESSAGE").html(message);
        },

        initMap : function(Latitude, Longitude, zoom) {
            var uluru = {lat: (Latitude != null ? Latitude : 37.5662952), lng: (Longitude != null ? Longitude : 126.97794509999994)};
            var map = new google.maps.Map(document.getElementById('googleMap'), {
                zoom: (zoom != null ? zoom : 10),
                center: uluru
            });

            var marker = new google.maps.Marker({
                position: uluru,
                map: map
            });
        },

        forStar : function(dateSize) {
            var star = "";
            for (var i = 0; i < dateSize; i++) {
                star += "*";
            }
            return star;
        },

        lpad : function(s, padLength, padString) {
            while(s.length < padLength)
                s = padString + s;
            return s;
        },

        alert : function(message) {
            var Dialog = tmsAlertDialog("TMS_ALERT", "");
            Dialog.dialog( "option", "title", "경고" );

            Dialog.dialog( "option", "buttons",[
                {
                    text: '확인',
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]);

            $("#TMS_ALERT").html(message);

            Dialog.dialog( "open" );
        },

        confirm : function(message, callback, params) {
            var Dialog = tmsConfirmDialog("TMS_CONFIRM", "");
            Dialog.dialog( "option", "title", "확인" );

            Dialog.dialog( "option", "buttons",[
                {
                    text: '취소',
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                },
                {
                    text: '확인',
                    click: function() {
                        $( this ).dialog( "close" );
                        eval(callback + "(" + (params != null && params != "" && params != "undifined" ? params + "," : "") + true + ")");
                    }
                }
            ]);

            message = message.replace(/(\n|\r\n)/g, '<br>');

            $("#TMS_CONFIRM").html(message);

            Dialog.dialog( "open" );
        },

        getStartNum : function(page, grid_id) {

            page = Number((page != null && page != "" && page != "undifined" ? page : "0"));
            var rows = $("#" + grid_id + "_pageSz option:selected").val();
            rows = Number((rows != null && rows != "" && rows != "undifined" ? rows : "5"));
            var max = $("#" + grid_id + "_allPage").val();
            page = (page == max ? page - 1 : page) + 1;
            var min = page * rows - (rows - 1) - 1;

            //NaN
            return Number((min != null && min != "" && min != "undifined" ? min : "0"));
        },

        getEndNum : function(page, grid_id) {

            page = Number((page != null && page != "" && page != "undifined" ? page : "0"));
            var rows = $("#" + grid_id + "_pageSz option:selected").val();
            rows = Number((rows != null && rows != "" && rows != "undifined" ? rows : "5"));
            var max = $("#" + grid_id + "_allPage").val();
            page = (page == max ? page - 1 : page) + 1;
            var min = page * rows - (rows - 1) - 1;
            var max = min + rows;

            //NaN
            return Number((max != null && max != "" && max != "undifined" ? max : "0"));
        },

        getMaxNum : function(grid_id) {
            var maxNum = $("#" + grid_id + "_pageSz option:selected").val();
            return Number((maxNum != null && maxNum != "" && maxNum != "undifined" ? maxNum : "5"));
        },

        reportPopViewer : function(paramsJson, popName, ozUrl){
            var url = ozUrl;
            //var paramters = encodeURIComponent(paramters);
            var param    = "";
            var cntParam = 0;
            for(variable in paramsJson)
            {
                if(cntParam == 0) param += "?";
                else param += "&";

                console.log(variable, paramsJson[variable]);
                param += variable + "=" + encodeURIComponent(paramsJson[variable]); //Prameter Add

                cntParam ++; // Count
            }

            //var width = 1250;
            //var height = 800;

            var width = screen.width;
            var height = screen.height;

            var left = 0;
            var top = 0;

            //var left = ((window.innerWidth / 2) - (width / 2)) + 100 ;
            //var top = ((window.innerHeight / 2) - (height / 2)) + 100;

            var windowFeatures = "toolbar=no,directories=no,scrollbars=no,resizable=no,status=yes,menubar=no, width="+width+", height="+height+", top=" + top + ", left=" + left;
            url = url+param;

            popName = popName == null || popName == undefined ? "Report" : popName.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\s]/gi, '');
            return window.open(url, popName, windowFeatures);

        },

        getSorting : function(grid_id, sort_do) {
            var sorting = GRID.GRID_MAP[grid_id].gridView.getSortedFields();
            var sort = "";
            $(sorting).each(function (i, mes) {
                sort += mes.fieldName + " " + (mes.direction == "ascending" ? "ASC" : (mes.direction != "" ? "DESC" : "")) + ",";
            });

            return (sort == "" ? sort_do : sort.slice(0, -1));
        },

        ajax : function(obj){
            var me = this;
            $.ajax({
                type:"POST",
                async: obj.async||false,
                url:obj.url,
                contentType: "application/json",
                data:JSON.stringify(obj.datas||{}),
                success:function(result) {

                    if(!me.isNull(obj.searchInitFunc) && typeof obj.searchInitFunc === 'function'){
                        obj.searchInitFunc(result);
                    }

                    if(!me.isNull(obj.callBackFunc) && typeof obj.callBackFunc === 'function'){
                        obj.callBackFunc(result);
                    }

                },
                error:function(e){
                    alert(e);
                    console.log("ERROR : ",e);
                }
            });
        },

        /* 조회시 사용할 PIVOT컬럼을 생성하는 함수
         *
         * dbColumns : 실재 데이터 베이스의 컬럼명 배열
         * gridColumns : 그리드에 데이터를 바인딩 할때 사용하는 그리드 컬럼명 배열
         * ABPP과의 통신시 컬럼명에 숫자가 있으면 에러가 나기 때문에 조회시 사용할 컬럼의 접두사
         */
        makeDynamicColumnForPivotSearch : function (dbColumns, gridColumns, columnPrefix){
            gridColumns = gridColumns==null?dbColumns:gridColumns;
            var pivotColumnInfo = {columnStr : "", pivlotInStr : ""};
            if(dbColumns != null && dbColumns.length == gridColumns.length){
                columnPrefix = columnPrefix==null? '_':columnPrefix;
                var cnt = dbColumns.length;
                for(var idx = 0; idx < cnt; idx++){
                    var dbColumn = dbColumns[idx];
                    var gridColumn = columnPrefix+gridColumns[idx];

                    pivotColumnInfo.columnStr += '"'+gridColumn+'",';
                    pivotColumnInfo.pivlotInStr += "'"+dbColumn+"' AS "+'"'+gridColumn+'",';

                }
                pivotColumnInfo.columnStr = pivotColumnInfo.columnStr.slice(0, -1).trim();
                pivotColumnInfo.pivlotInStr = pivotColumnInfo.pivlotInStr.slice(0, -1).trim();
            }else{
                console.log("makeDynamicColumn ERROR");
            }

            return pivotColumnInfo;
        },
        /*Client -> FrameOneController -> Abpp로 통신하던 과정을
         * Client -> Abpp로 직접 통신하도록 변경하는 함수
         * option : 기존 방식으로 하던 Ajax파라미터(service 필수)(option.data = JSONString)
         * isThroughFrameOne : 기존 방식 통신 여부(FrameOneController 사용여부)
         */
        callAbppAjax : function(option, isThroughFrameOne){
            isThroughFrameOne = isThroughFrameOne == null? false:isThroughFrameOne;
            var ajaxUrl = "";
            var param = JSON.parse(option.data).data_set;

            if(param.service == null || param.service == ''){
                var msg = 'not Exist Parameter service'
                console.log(msg);
                alert(msg);
                return false;
            }
            var parameter = null;
            var domain = window.location.hostname;
            if(isThroughFrameOne){
                if(option.url == null || option.url == ''){
                    var msg = 'not Exist Parameter url';
                    console.log(msg);
                    alert(msg);
                    return false;
                }
                ajaxUrl = option.url;
                parameter = option.data;
            }else{
                if (domain =="localhost") {
                    ajaxUrl = "http://wndtmsdev.cjlogistics.com";
                }else{
                    ajaxUrl = "http://"+domain;
                }
                ajaxUrl += "/base/rest/FC_TMS/";
                ajaxUrl += param.service+"/1.0";
                param.UserID = LOGIN_USER_ID_FOR_ABPP.getUserId();
                parameter = JSON.stringify(param);
            }
            option.async = option.async == null ? true : option.async;
            option.contentType = option.contentType == null ? "application/json" : option.contentType;
            option.type = option.type == null? "POST" : option.type;
            $.ajax({
                type:option.type,
                async: option.async,
                url:ajaxUrl,
                contentType: option.contentType,
                data:parameter,
                success:function(data) {
                    if(option.success != null){
                        if(!isThroughFrameOne){
                            var searchResult = data.SQL_RESULT;
                            if(searchResult != null && searchResult.constructor.toString().indexOf("Array") == -1){
                                data.SQL_RESULT = [searchResult];
                            }
                            data = {ds_master : data};
                        }
                        option.success(data);
                    }
                },
                error:function(e) {
                    if(option.error != null){
                        option.error(e);
                    }
                }
            });
        },
        /**
         * 매뉴 전환이나, FRAMEONE을 반드시 통해서 가야하는 경우
         * 따로 로그인 체크(abpp)하는 함수
         */
        checkAbppLogin : function (){
            cj.callAbppAjax({
                data:JSON.stringify({data_set : {"service" : "LoginCheck"}})
            });
        }
    };
})();

//공통처리
$(document).ready(function() { //실행될 코드
    if($("._navigationList span").html() == 'TMS'){
        //TMS 관련 화면만 ABPP로그인 체크
        cj.checkAbppLogin();
    }
    //로딩바 구현
    var images = $("#ajaxLoding").html();
    var $loading = $('<div id="loading" class="loading" ></div>' + images).appendTo(document.body).hide();
    $(document).ajaxStart(function(){
        $loading.show();
    });


    /*// 모든 Ajax 요청 전에 실행되는 함수
    $(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
        if (ajaxOptions.data) {
            ajaxOptions.data = sanitizeParams(ajaxOptions.data);
        }
    });
    */

    function sanitizeParams(params) {
        var sanitizedParams = {};
        try {
            var parsedParams = JSON.parse(params);
            for (var key in parsedParams) {
                if (parsedParams.hasOwnProperty(key)) {
                    var value = parsedParams[key];
                    if (typeof value === 'string') {
                        value = value.replace(/<script.*?>|<\/script>/gi, '');
                        value = value.replace(/'/g, "''");
                    }else if (typeof value === 'object') {
                        value = checkSanitizeParams(value);
                    }
                    sanitizedParams[key] = value;
                }
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            sanitizedParams = {};
        }
        return JSON.stringify(sanitizedParams);
    }

    function checkSanitizeParams(value) {
        if (typeof value === 'string'){
            value = value.replace(/<script.*?>|<\/script>/gi, '');
            value = value.replace(/'/g, "''");
        }else if (typeof value === 'object') {
            for (var subKey in value) {
                if (value.hasOwnProperty(subKey)) {
                    var subValue = value[subKey];
                    if (typeof subValue === 'string') {
                        if (subValue != null || subValue != undefined || subValue != "") {
                            subValue = subValue.replace(/<script.*?>|<\/script>/gi, '');
                            subValue = subValue.replace(/'/g, "''");
                        }
                    }else if (typeof subValue === 'object') {
                        if (subValue != null) {
                            checkSanitizeParams(subValue);
                        }
                    }
                }
                value[subKey] = subValue;
            }
        }
        return value;
    }

    $(document).ajaxComplete(function(){
        $loading.hide();
    });

    $( window ).resize( function() {
        makeReSize()
    });

    //숫자만입력
    $(".only-num").keyup(function(e) {
        if (!(e.keyCode >=37 && e.keyCode<=40)) {
            var v = $(this).val();
            $(this).val(v.replace(/[^0-9]/gi, ''));
        }
    });
    $(".only-num").focusout(function(e) {
        var v = $(this).val();
        $(this).val(v.replace(/[^0-9]/gi,''));
    });

    //한글입력제한
    $(".not-kor").keyup(function(e) {
        if (!(e.keyCode >=37 && e.keyCode<=40)) {
            var v = $(this).val();
            $(this).val(v.replace(/[\ㄱ-ㅎㅏ-ㅣ가-힣]/gi,''));
        }
    });
    $(".not-kor").focusout(function(e) {
        var v = $(this).val();
        $(this).val(v.replace(/[\ㄱ-ㅎㅏ-ㅣ가-힣]/gi,''));
    });

    //영어입력제한
    $(".not-eng").keyup(function(e) {
        console.log("ENG");
        if (!(e.keyCode >=37 && e.keyCode<=40)) {
            var v = $(this).val();
            $(this).val(v.replace(/[a-z]/gi,''));
        }
    });
    $(".not-eng").focusout(function(e) {
        console.log("ENG");
        var v = $(this).val();
        $(this).val(v.replace(/[a-z]/gi,''));
    });

    //툴팁
    //$(document).tooltip();
    $("#tooltip").dblclick(function() {
        var Dialog = tmsDialog("TMS_MESSAGE", "");
        Dialog.dialog( "option", "title", "Message" );

        Dialog.dialog( "option", "buttons",[
            {
                text: 'Close',
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]);

        Dialog.dialog( "open" );

    });
});

//팝업설정 툴팁
function tmsDialog(divName, formName, options) {
    if (options == null) {
        options = {"height" : 300, "width" : 500};
    }
    var dialog = $("#" + divName).dialog({
        title: "",
        autoOpen: false,
        height: options.height,
        width: options.width,
        modal: true,
        buttons: {},
        close: function() {}
    });
    return dialog;
};

//팝업설정 alert
function tmsAlertDialog(divName, formName, options) {
    if (options == null) {
        options = {"height" : 150, "width" : 300};
    }

    var dialog = $("#" + divName).dialog({
        title: "",
        autoOpen: false,
        /*position:[Math.ceil((window.screen.width - 300)/2), 200],*/
        height: options.height,
        width: options.width,
        modal: true,
        buttons: {},
        close: function() {}
    });
    return dialog;
};

//팝업설정 confirm
function tmsConfirmDialog(divName, formName, options) {
    if (options == null) {
        options = {"height" : 180, "width" : 350};
    }

    var dialog = $("#" + divName).dialog({
        title: "",
        autoOpen: false,
        /*position : [Math.ceil((window.screen.width - 300)/2),200],*/
        height: options.height,
        width: options.width,
        modal: true,
        buttons: {},
        close: function() {}
    });
    return dialog;
};


;(function() {
    "use strict";
    
    var $form_add_task = $(".add-task")
        , task_list = []
        , $delete_task
        , $task_detail_btn
        , $task_detail_mask = $(".task-detail-mask")
        , $task_detail = $(".task-detail")
        , $update_form
        , $task_detail_
        , $completed_checkbox
        ;

     init();

     //提交按钮的提交事件处理程序
     function on_add_task_form_submit(e) {
        var new_task = {}, $input;
        e.preventDefault();
        $input = $(this).find("input[name=content]");
        new_task.content = $input.val();
        if (!new_task.content) return;
        if(add_task(new_task)) {
            $input.val(null);
        }
    }
    //给添加任务的提交按钮和遮罩注册相应的事件处理程序
    $form_add_task.on("submit", on_add_task_form_submit)
    $task_detail_mask.on("click", hide_task_detail)
    
    function listern_delete_task() {
        $delete_task.on("click", function() {
        var $item = $(this).parent().parent();
        var $index = $item.data("index");
        var temp = confirm("确定删除吗？")
        temp? delete_task($index): null;
        })
    }
    //给详情按钮注册点击事件，显示详情页
    function listern_task_detail() {
        $(".task-item").on("dblclick", function() {
            var index = $(this).data("index");
            show_task_detail(index);
        })
        $task_detail_btn.on("click", function() {
            var $item = $(this).parent().parent();
            //要显示对应任务项的详情，必须先取出任务项的项目标识
            var index = $item.data("index");
            show_task_detail(index);

        })
    }
    //监听复选框单击事件，并给任务数据对象添加属性completed追踪选中状态
    function listen_completed_checkbox() {
        $completed_checkbox.on("click", function() {
            var $this = $(this);
            var index = $this.parent().parent().data("index");
            var item = store.get("task_list")[index];
            if (item.complete) {
                update_task_detail(index, {complete: false});
            } else {
                update_task_detail(index, {complete: true});
            }
        })
    }
    //先渲染详情页，并和遮罩一起显示出来
    function show_task_detail(index) {
        render_task_detail(index);
        $task_detail.show();
        $task_detail_mask.show();
    }
    //封装隐藏详情页和遮罩的函数
    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }
    //当详情页表单要提交时要调用的更新详情页的函数
    function update_task_detail(index, new_data) {
        if(!new_data) return;
        task_list[index] = $.extend({}, task_list[index], new_data);
        refresh_task_list();
    }

    // 单击每条任务详细时，渲染相对应的任务详情
    function render_task_detail(index) {
        if (!task_list[index]) return;

        var item = task_list[index];
        //创建一个要添加进文档的任务详情模板
        var tpl = '<form>' +
                    '<div class="content input-item">'+ '<p>' + item.content + '</p>' + 
                    '<div><input style="display:none;" name="content" value="'+ item.content +'" type="text" /></div>' 
                    + '</div>' +
                    '<div class="desc input-item">' +
                        '<textarea name="desc" placeholder="这里写备忘录的详情">' + (item.desc || '') + '</textarea>' +
                    '</div>' +
                '<div class="remind input-item">' + '<label for="">提醒时间</label>' +
                    '<input type="date" value="'+ item.time +'"/>' + 
                '</div>' +
                '<div class="input-item"><button class="detail-btn" type="submit">更改</button></div>' +
            '</form>';
        
        $task_detail.html("");
        $task_detail.html(tpl);

        $update_form = $task_detail.find("form");
        var $task_detail_content = $update_form.find(".content");
        var $task_detail_input = $update_form.find("[name=content]");
        $task_detail_content.on("dblclick", function() {
            // console.log('1', 1);
            $task_detail_input.show();
            $task_detail_content.find("p").hide();
        })

        $update_form.on("submit", function(e) {
            e.preventDefault();
            var new_data = {};
            new_data.desc = $(this).find("[name=desc]").val() || '';
            new_data.content = $task_detail_input.val() || item.content;
            new_data.time = $(this).find(".remind input").val();
            update_task_detail(index, new_data);
            hide_task_detail();

        })
    }

    //将任务数据（添加任务输入框的值）用数组存储，并更新localstorage，渲染任务列表
    function add_task(new_task) {
        task_list.push(new_task);
        refresh_task_list();
        return true;
    }
    //更新localstorage并渲染任务列表
    function refresh_task_list() {
        store.set("task_list", task_list);
        render_task_list();
    }

    function delete_task(index) {
        task_list.splice(index, 1);
        refresh_task_list();
    }
    
    function init() {
        task_list = store.get("task_list") || [];
        if(task_list.length) {
            render_task_list();
        }
    }

    // 将每一项任务添加（渲染）到DOM结构中，渲染结束后要监听删除和详情事件
    function render_task_list() {
        var $task_list = $(".task-list");
        $task_list.html("");
        var completed_items = [];
        for(var i=0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete) {
                completed_items[i] = item;
            } else {
            //渲染任务列表时，要把存储在任务列表数组里的每一项用户输入的数据渲染出来
            var $task = render_task_item(task_list[i], i);
            $task_list.prepend($task);
            }
        }
        for(var j = 0; j < completed_items.length; j++) {
            var $task = render_task_item(completed_items[j], j);
            if(!$task) continue;
            $task.addClass("completed");
            $task_list.append($task);
        }
        //渲染完成后才能取到删除和详情按钮对象
        $delete_task = $(".action.delete");
        $task_detail_btn = $(".action.detail");
        $completed_checkbox = $(".task-list .complete[type=checkbox]");
        listern_delete_task();
        listern_task_detail();
        listen_completed_checkbox();
    }

     //渲染单条任务项
    function render_task_item(data, index) {
        if(!data) return;
        //创建单条任务项的模板
        var task_item_tpl = "<div class='task-item' data-index='" + index + "'>" +
               "<span><input class='complete' " + (data.complete ? "checked" : "") + " type='checkbox'></span>" +
                "<span>" + data.content + "</span>" + 
                "<span class='fr'>" +
                "<span class='action delete'> 删除 </span>" + 
                "<span class='action detail'> 详情 </span>" + "</span>" +
            "</div>";
            //返回模板的jQuery对象
        return $(task_item_tpl);
    }
})();

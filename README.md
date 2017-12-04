###一个简单的单页应用todolist
--------------------------------------------------------
**项目的功能模块介绍**

1. 在文本框中输入备忘录，点击提交按钮或键入回车键便把相应任务渲染在文本框下方
2. 后续每添加一条任务，都会显示在任务列表的第一个
3. 在每条任务上都有相应的删除任务和显示详情按钮
4. 单击详情按钮，可以双击任务标题更改任务标题、设置任务详情、提醒时间，时间到后会有相应提醒
5. 单击详情按钮，背景透明度发生变化，单击更改或回车或者单击背景都可以保存并退出详情页
6. 点击任务最前面的复选框可以标记任务完成，并显示在任务列表最后一条，透明度改变，添加删除线
7. 双击每条任务，可以显示每条任务详情
8. 修改单击删除按钮后的默认系统弹框，使得具有更好的用户体验

![演示图片](http://ww3.sinaimg.cn/large/0060lm7Tly1fm52vxkc8eg30if0eln5m.gif
)

**主要技术点**

1. 样式的初始化采用初始化库normalize.css
2. 每条任务的数据存储采用浏览器本地存储localstorage，并引用了stor.js库
3. 项目采用jQuery编写js，整个js布局采用一个入口函数init(),其他函数都是定义功能方法
4. 为了提高用户体验，提醒时间表单采用jQuery插件datetimepicker，可以具体到时间点
5. 删除提醒弹框采用自定义模板渲染，利用promise机制异步完成任务删除，用一个定时器setInterval来测试用户是否单击了弹框的按钮

*入口函数init以及渲染任务关键代码：*
> ```
>   //主入口函数
>      function init() {
>      //每次用浏览器打开应用，都将浏览器localstorage中存储的任务数据取出并渲染出来
        task_list = store.get("task_list") || [];
        //每次用浏览器打开应用，都检测下消息提醒
        listen_msg_event();
        if(task_list.length) {
            render_task_list();
            check_task_remind();
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
    ```



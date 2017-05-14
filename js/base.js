/**
 * Created by Moby on 2017/5/5.
 */
;(function () {
    'use strict';
    // console.info("$", $); // 测试jQuery是否加载成功
    // console.info("jQuery", jQuery); // 测试jQuery是否加载成功
    var store = require('store'); // node_modules/.bin/webpack js/base.js js/base.bundle.js
    $.datetimepicker.setLocale('zh');

    var $form_task_add = $('.task-add'),
        task_list = [],
        $btn_delete,
        $btn_detail,
        $container_mask = $('.container-mask'),
        $task_detail = $('.task-detail'),
        $task_list = $('.task-list'),
        $task_list_complete = $('.task-list-complete'),
        $task_complete_btn = $('.task-complete-btn'),
        isShowComplete = false;

    init();

    /**
     * 新增任务条目
     * @param task
     * @returns {boolean}
     */
    function add_task(task) {
        task_list.push(task);
        refresh_task_list();
        return true;
    }

    /**
     * 根据索引删除任务条目
     * @param index
     */
    function delete_task(index) {
        if (index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();
        render_task_list();
    }

    /**
     * 渲染任务列表
     */
    function render_task_list() {
        $task_list.html('');
        $task_list_complete.html('');
        for (var i = 0; i < task_list.length; i++) {
            if (!task_list[i]) continue;
            var $task = render_task_item(task_list[i], i);
            if (task_list[i].complete) {
                $task.addClass('task-complete');
                $task_list_complete.append($task);
            } else {
                $task_list.append($task);
            }
        }
        // 按钮绑定事件
        $btn_delete = $('.inner-action.delete');
        $btn_detail = $('.inner-action.detail');
        $btn_delete.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            if (!confirm('您确定删除吗？')) return;
            delete_task($item.data('index'));

        });
        $btn_detail.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            render_task_detail($item.data('index'));

        });
        $task_list.find('div[name=taskItem]').on('dblclick', function () {
            var $item = $(this);
            render_task_detail($item.data('index'));
        });
        $task_list.find('div[name=taskItem] input[type=checkbox]').on('change', function (evt) {
            var $this = $(this);
            var is_complete = $this.is(':checked');
            var index = $this.parent().parent().data('index');
            update_task_detail(index, {complete: is_complete});
            render_task_list();
        });
        $task_list_complete.find('div[name=taskItem]').on('dblclick', function () {
            var $item = $(this);
            render_task_detail($item.data('index'));
        });
        $task_list_complete.find('div[name=taskItem] input[type=checkbox]').on('change', function (evt) {
            var $this = $(this);
            var is_complete = $this.is(':checked');
            var index = $this.parent().parent().data('index');
            update_task_detail(index, {complete: is_complete});
            render_task_list();
        });
    }


    /**
     * 渲染任务列表条目
     * @param data
     * @param index
     * @returns {*|jQuery|HTMLElement}
     */
    function render_task_item(data, index) {
        if (!data || !index) return;
        var task_item_tpl =
            '<div class="task-item" name="taskItem" data-index="' + index + '">' +
            '<span><input type="checkbox" ' + (data.complete ? "checked" : "") + '></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="inner-action-bar">' +
            '<span class="inner-action delete"> 删除 </span>' +
            '<span class="inner-action detail"> 详细 </span>' +
            '</span>' +
            '</div>';
        return $(task_item_tpl);
    }

    /**
     * 任务数据持久化
     */
    function refresh_task_list() {
        store.set('task_list', task_list);
    }

    /**
     * 初始化页面
     */
    function init() {
        task_list = store.get('task_list') || [];
        if (task_list.length) render_task_list();

        /**
         * 监听事件，任务新增提交按钮
         */
        $form_task_add.on('submit', function (e) {
            var task_new = {}, $task_input = $(this).find('input[name=ipt_task_add]');
            // 禁用默认提交
            e.preventDefault();
            task_new.content = $task_input.val();
            // 如果为空，则返回
            if (!task_new.content) return;
            // 保存new task
            if (add_task(task_new)) {
                render_task_list();
                $task_input.val('');
            }
        });

        $task_complete_btn.on('click', function (evt) {
            isShowComplete = !isShowComplete;
            var $this = $(this);
            $this.text((isShowComplete ? "隐藏" : "显示") + "已完成");
            changeCompleteShowStatus(isShowComplete);
        });

        changeCompleteShowStatus(isShowComplete);
        check_task_remind();
    }

    /**
     * 渲染任务详情页面
     * @param index
     */
    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) return;
        var item = task_list[index];
        $container_mask.show();
        $task_detail.show();
        var task_detail_tpl = '<form>' +
            '<div class="task-detail-item">' +
            '<div class="content">' + item.content + '</div>' +
            '<input type="text" name="content" value="' + item.content + '">' +
            '</div>' +
            '<div class="description task-detail-item">' +
            '<textarea name="detail" placeholder="请输入任务详细描述信息...">' + (item.detail || '') + '</textarea>' +
            '</div>' +
            '<div class="remind task-detail-item">' +
            '<lable>提醒时间</lable>' +
            '<input class="datetime" type="text" value="' + (item.date || '') + '">' +
            '</div>' +
            '<div class="task-detail-item">' +
            '<button type="submit">保存</button>' +
            '</div>' +
            '</form>';
        $task_detail.html(task_detail_tpl);
        $task_detail.find('div[class=content]').show();
        $task_detail.find('input[name=content]').hide();
        $task_detail.css({
            left: ($(window).width() - $task_detail.width()) / 2,
            top: ($(window).height() - $task_detail.height()) / 2 + $(document.body).scrollTop()
        });
        $task_detail.find('input[class=datetime]').datetimepicker();
        $container_mask.on('click', function () {
            $container_mask.hide();
            $task_detail.hide();
        });
        $task_detail.find('form').on('submit', function (e) {
            e.preventDefault();
            item.content = $task_detail.find('input[name=content]').val();
            item.detail = $task_detail.find('textarea[name=detail]').val();
            item.date = $task_detail.find('input[class=datetime]').val();
            update_task_detail(index, item);
        });
        $task_detail.find('div[class=content]').on('click', function () {
            $task_detail.find('div[class=content]').hide();
            $task_detail.find('input[name=content]').show();
            $task_detail.find('input[name=content]').focus();
            $task_detail.find('input[name=content]').select();
        });
        $task_detail.find('textarea').focus();
    }

    function update_task_detail(index, data) {
        if (index === undefined || !data) return;
        $.extend(task_list[index], data);
        refresh_task_list();
        render_task_list();
    }

    function changeCompleteShowStatus(isShowComplete) {
        isShowComplete ? $task_list_complete.show() : $task_list_complete.hide();
    }

    function check_task_remind() {
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                if (!task_list[i] || !task_list[i].date) continue;
                var item = task_list[i], task_timestamp;
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.date)).getTime();
                console.log(new Date().getHours() + ":" + new Date().getMinutes());
                if (task_timestamp > current_timestamp && task_timestamp - current_timestamp <= 300000 ) { // 提前5分钟（5 * 60 * 1000ms）开始提醒
                    notify_task_remind(item.content);
                }
            }
        }, 60000); // 每分钟(60 * 1000ms)检查一次任务提醒

    }

    function notify_task_remind(content) {

        console.info(content);
    }


})();
/**
 * (function(){ ... })()
 * 写法用途：
 * 1.自调用
 * 2.限定作用域
 */
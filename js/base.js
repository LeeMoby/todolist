/**
 * Created by Moby on 2017/5/5.
 */
;(function () {
    'use strict';
    // console.info("$", $); // 测试jQuery是否加载成功
    // console.info("jQuery", jQuery); // 测试jQuery是否加载成功
    var store = require('store'); // node_modules/.bin/webpack js/base.js js/base.bundle.js

    var $form_task_add = $('.task-add'), task_list = [];


    init();

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

    function add_task(task) {
        task_list.push(task);
        store.set('task_list', task_list);
        return true;
    }

    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        for (var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i]);
            $task_list.append($task);

        }
    }

    function render_task_item(data) {
        var task_item_tpl =
            '<div class="task-item">' +
            '<span><input type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="inner-action-bar">' +
            '<span class="inner-action"> 删除 </span>' +
            '<span class="inner-action"> 详细 </span>' +
            '</span>' +
            '</div>';
        return $(task_item_tpl);

    }

    function init() {
        task_list = store.get('task_list') || [];
        if (task_list.length) render_task_list();
    }

})();
/**
 * (function(){ ... })()
 * 写法用途：
 * 1.自调用
 * 2.限定作用域
 */
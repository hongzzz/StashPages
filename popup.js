const stashBt = document.querySelector('#stash');
const main = document.querySelector('#main');
const titleInput = document.querySelector('#title-input');


const showItems = async () => {
    let items = await getItems();
    for (let item of items) {
        let li = document.createElement('li');
        li.className = 'stash-item';
        li.innerHTML = `<div class="stash-title">${item.title}</div>
                        <div class="stash-time">${item.tabs.length} tabs---${new Date(item.time).toLocaleString()}</div>`;

        let popButton = document.createElement('button');
        popButton.className = 'pop-button';
        popButton.innerHTML = 'Pop';
        popButton.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteItem(item);
        });
        let delButton = document.createElement('button');
        delButton.className = 'del-button';
        delButton.innerHTML = 'Del';
        delButton.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteItem(item);
        });

        li.appendChild(popButton);
        li.appendChild(delButton);
        li.addEventListener('click', function () {
            deleteItem(item);
        });
        main.appendChild(li);
    }
}

// 获取当前标签页
const getTabs = () => {
    let arr = [];
    return new Promise(resolve => {
        chrome.tabs.query({}, function (tabs) {
            tabs.map((tab, index) => {
                // 排除空标签页
                if (tab.url !== 'chrome://newtab/') {
                    arr.push({ title: tab.title, url: tab.url });
                }
            });
            resolve(arr);
        });
    });
}

// 获取stash
const getItems = async () => {
    console.log('get items start');
    let items = [];
    return new Promise(resolve => {
        chrome.storage.sync.get(null, function (result) {
            console.log(result);
            for (let key in result) {
                if (key.startsWith('item_')) {
                    items.push(result[key]);
                }
            }
            // 按时间倒序排列
            items.sort((a, b) => {
                return b.time - a.time;
            });
            resolve(items);
        });
    });
}

// 设置stash
const setItem = (item) => {
    let itemStr = `item_${item.time}`;
    return new Promise(resolve => {
        chrome.storage.sync.set({ [itemStr]: item }, function () {
            console.log('set item');
            console.log(item);
            init();
            resolve();
        });
    });
}

// 删除
const deleteItem = (item) => {
    let itemStr = `item_${item.time}`;
    return new Promise(resolve => {
        chrome.storage.sync.remove([itemStr], function () {
            console.log('removed ' + itemStr);
            init();
            resolve();
        });
    });
}

const stash = async () => {
    let arr = await getTabs();
    // 标签页不为空才进行stash
    if (arr.length !== 0) {
        // 根据时间戳创建独一对象
        let title = titleInput.value || 'default';
        let item = {
            tabs: arr,
            title: title,
            time: +new Date()
        };
        return await setItem(item);
    }
}

async function init () {
    console.log('init');
    main.innerHTML = '';
    await showItems();
    titleInput.focus();
}


// 注册按钮
stashBt.addEventListener('click', stash);
init();
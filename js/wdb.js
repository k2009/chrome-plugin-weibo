+ function() {

// db函数方法

    // 兼容jquery,可以直接$.db调用,同时兼容define()引用require后自主命名,db函数无依赖,兼容性.....暂时未测;
    // $.db({
    //     dbName: "数据库名",
    //     tableName: "子表名" //若不填子表名,子表名为数据库名
    // }, {
    //     key: '创建时必填,数据库查询单条数据的身份识别码,之后修改无效,只能删库重来...',
    //     index: []
    // }).open(function(event) { //异步打开indexDB,若无tableName,则直接关闭数据库,提升数据库版本后新建该子表;

        // event内可挂载方法:
            // event.add(value):向当前数据库添加一条新纪录(keyPath唯一,如果已有,会报错)(若传入参数为数组,则添加多条记录);
            // event.put(value):向当前数据库添加或更新一条新纪录(keyPath唯一,如果未找到keyPath,则新增,若找到,则更新)(若传入参数为数组,则put多条记录);
            // event.get( keyPath||callback , null||callback ):如果传入的第一个参数是function,那么直接获取当前仓库的所有数据,若不是,则通过keyPath获取当前数据库内的单条数据;
            // event.each(callback,eachEndFn):逐条读取当前仓库内的所有数据,每次读取完执行callback,当读取全部完成时,执行第二参数eachEndFn方法;
            // event.close():关闭当前数据库(indexedDB单个页面只能打开一个数据库,若需要打开别的库,必须先关闭库才能再打开);
            // event.delete():删除当前仓库;
            // event.clear():清空当前仓库;
            // event.range():获取在某条之前或之后或包含该条或不包含该条的数据集    构思中...尚未完善

    // }).deleteDB() //直接删除主表;

    function db(opt, columns) {
        "use strict";
        return new(function(opt, columns) {

            var indexedDB = window.indexedDB || window.mozIndexeDB || window.webkitIndexedDB || window.msIndexedDB;
            var IDBTransaction = window.IDBTransaction || window.webKitIDBTransaction || window.msIDBTransaction;
            var IDBKeyRange = window.IDBKeyRange || window.webKitIDBKeyRange || window.msIDBKeyRange;
            var database = (typeof opt == 'string') ? opt : opt.dbName;
            var tableName = (typeof opt == 'string') ? opt : opt.tableName;
            var version = null;
            var _this = this;
            var _callback = {
                'name': opt.tableName||database,
                'db': undefined,
                'sort': 'next',
                'close': function() {
                    this.db.close();
                },
                'add': function(value) {
                    var objectStore = this.db.transaction(this.name, "readwrite").objectStore(this.name);
                    objectStore.oncomplete = function(event) {};
                    objectStore.onerror = function(event) {
                        console.error("错误transaction:", event.target.errorCode);
                    };
                    if(value instanceof Array){

                        var len = values.length;
                        for (var i = 0; i < len; i++) {
                            objectStore.add(values[i]);
                        }
                    }else{
                        objectStore.add(value);
                    }
                    
                },
                'putAll': function(values) {
                    this.put(values);
                },
                'put': function(value) {
                    var objectStore = this.db.transaction(this.name, "readwrite").objectStore(this.name);
                    if(!value){
                        return;
                    }
                    objectStore.oncomplete = function(event) {};
                    objectStore.onerror = function(event) {
                        console.error("错误transaction:", event.target.errorCode);
                    };
                    if(value instanceof Array){

                        var len = values.length;
                        for (var i = 0; i < len; i++) {
                            objectStore.put(values[i]);
                        }
                    }else{
                        objectStore.put(value);
                    }
                },
                'each': function(callback,fn) {
                    var objectStore = this.db.transaction(this.name, "readonly").objectStore(this.name);
                    IDBKeyRange.NEXT = this.sort;
                    objectStore.openCursor(null, IDBKeyRange.NEXT).onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (callback == undefined || typeof callback != 'function') return;
                        if (!cursor) {
                            if(fn){
                                fn();
                            }
                            return;
                        };
                        callback(cursor.value);
                        cursor.continue();
                    };
                },
                'get': function(key, callback) {
                    var objectStore = this.db.transaction(this.name, "readonly").objectStore(this.name);
                    var datas = [];
                    if (typeof key == 'function' && typeof callback != 'function' ) {
                        IDBKeyRange.NEXT = this.sort;
                        objectStore.openCursor(null, IDBKeyRange.NEXT).onsuccess = function(event) {
                            var cursor = event.target.result;
                            if (!cursor) {
                                key(datas);
                                return;
                            }
                            datas.push(cursor.value);
                            cursor.continue();
                        }; //end onsuccess
                    }else if (typeof callback == 'function'){
                        objectStore.get(key).onsuccess = function(event) {
                            callback(event.target.result);
                        };
                    }
                },
                'range': function(column, callback) {
                    /************
          e-> key e1
          e1 -> >|< num t |$
          t -> & e1 | $
          ************
                keys>1&<10
                ************/
                    console.log(column);
                    var i = 0;
                    var getChar = function() {
                        if (column.length >= i)
                            return column[i++];
                    };
                    var getCol = function() {
                        var val = getChar();
                        var s = "";
                        if (val >= 'a' && val <= 'z' || val >= 'A' && val <= 'Z') {
                            do {
                                s += val;
                                val = getChar();
                            } while (val >= 'a' && val <= 'z' || val >= 'A' && val <= 'Z');
                            i--;
                        }
                        console.log(s);
                        return s
                    };
                    var getVal = function() {
                        var val = getChar();
                        var s = "";
                        do {
                            s += val;
                            val = getChar();
                        } while (val != '&' && i <= column.length);
                        console.log("val", s);
                        return s
                    };
                    var objectStore = this.db.transaction(this.name, "readonly").objectStore(this.name);
                    var index = objectStore.index(getCol());
                    sym = getChar();
                    console.log(sym);
                    var range = undefined;
                    switch (sym) {
                        case '>':
                            /*>=*/
                            if (getChar() == '=') {
                                range = IDBKeyRange.lowerBound(getVal());
                            } else {
                                i--;
                                range = IDBKeyRange.lowerBound(getVal(), true);
                            }
                            i--;
                            s = getChar();
                            if (s == '&') {
                                getChar();
                                if (range != undefined && typeof range === 'object') {
                                    if (getChar() == '=') {
                                        range = IDBKeyRange.bound(range.lower, getVal(), range.lowerOpen, false);
                                    } else {
                                        i--;
                                        range = IDBKeyRange.bound(range.lower, getVal(), range.lowerOpen, true);
                                    }
                                }
                            }
                            break;
                        case '<':
                            /*<=*/
                            if (getChar() == '=') {
                                range = IDBKeyRange.upperBound(getVal());
                            } else {
                                i--;
                                range = IDBKeyRange.upperBound(getVal(), true);
                            }
                            i--;
                            s = getChar();
                            if (s == '&') {
                                getChar();
                                if (range != undefined && typeof range === 'object') {
                                    if (getChar() == '=') {
                                        range = IDBKeyRange.bound(getVal(), range.upper, false, range.upperOpen);
                                    } else {
                                        i--;
                                        range = IDBKeyRange.bound(getVal(), range.upper, true, range.upperOpen);
                                    }
                                }
                            }
                            break;
                        case '=':
                            range = IDBKeyRange.only(getVal());
                            break;
                    }
                    console.log(range);
                    IDBKeyRange.NEXT = this.sort;
                    index.openCursor(range, IDBKeyRange.NEXT).onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (callback == undefined || typeof callback != 'function') return;
                        if (!cursor) return;
                        callback(cursor.value);
                        cursor.continue();
                    }
                },
                'delete': function(key) {
                    var request = this.db.transaction(this.name, "readwrite").objectStore(this.name);
                    request.delete(key);
                    request.onsuccess = function(event) {
                        console.log("delete success");
                    };
                },
                'clear': function() {
                    var request = this.db.transaction(this.name, "readwrite").objectStore(this.name);
                    request.clear();
                    request.onsuccess = function(event) {
                        console.log("clear success");
                    };
                }
            };
            //////////////////////////////////////////////////////////////////////////////////////////////////////

            this.deleteDB = function() {
                indexedDB.deleteDatabase(database);
            };
            this.open = function(callback) {
                var request;
                if (!indexedDB) {
                    alert("浏览器没有indexedDB!");
                }
                console.log("数据库已打开");
                if (version != undefined && typeof version === "number")
                    request = indexedDB.open(database, version);
                else
                    request = indexedDB.open(database);

                request.onerror = function(event) {
                    console.log(database, "error", event);
                };
                request.onblocked = function(event) {
                    console.log("Please close all other tabs with this site open!");
                };
                request.onsuccess = function(event) {
                    version = this.result.version;
            　　    if(!this.result.objectStoreNames.contains(_callback.name)) { 
                        console.log('找不到子表,开始创建子表'+_callback.name+'...'+'版本:'+(++version));
                        console.log('数据库关闭!')
                        this.result.close();
                        _this.open(callback);

                        return;
            　　    }
                    if (callback != undefined && typeof callback === "function") {
                        _callback.db = this.result;
                        callback(_callback);
                    }
                };
                request.onupgradeneeded = function(event) {
                    /********
                     {
                         keyPath:'id',
                         index:[{email:{unique:true}}]
                     }
                    ********/
                    console.log("数据库升级中....开始建表");
                    keyPath = {
                        autoIncrement: true
                    };
                    if (columns != undefined && columns.key != undefined) {
                        keyPath = {
                            'keyPath': columns.key
                        };
                    }
                    var store = event.currentTarget.result.createObjectStore(_callback.name, keyPath);
                    if (columns != undefined && columns.index != undefined) {
                        index = columns.index;
                        for (var i = 0; i < index.length; i++) {
                            j = index[i];
                            for (var field in j) {
                                console.log(field, j[field]);
                                store.createIndex(field, field, j[field]);
                            }
                        }
                    }
                };
            };
        })(opt, columns);
    }
    if (typeof $ === 'function') {
        $.db = db;
    }
    "function"==typeof define&&define(function(){return db});
}()
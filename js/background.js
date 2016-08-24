$(function() {

	var sys = {

		debug: true,
		init() {
			sys.aLog = ['程序开始运行!'];
			sys.logGap = 0;
			sys.listener();
		},
		db_name: "reptile_DB",
		log(msg){
			console.log(msg);
			if(typeof msg == "string"){
				sys.fn_logGap(msg);
			}
		},
		fn_logGap(msg){
			sys.aLog.push(msg);
			if((Date.parse(new Date()) - sys.logGap) > sys.gap){
				chrome.extension.sendRequest({									//向popup.js发送消息
					type:"msg",
					msg:sys.aLog
				}, function(request) {

				});
				sys.aLog = [];
				sys.logGap = Date.parse(new Date());
			}
		},
		wdb_open(callBack) {
			$.db({
				dbName: sys.db_name,
				tableName: "storeDB"
			}, {
				key: 'storeID',
				index: []
			}).open(function(obj) { //异步打开indexDB
				callBack(obj);
				let now = $.parseJSON(sys.storage('now'));
				if(now){
				sys.log(now);
					obj.each(function(data) {
						sys.log(data.storeID);
						sys.log(now.storeID)
						if (data.go == 'go' && data.storeID == now.storeID) {
							sys.act_opt = data;
							sys.act_opt.now = now;
							sys.getListData(data, function() {});
						}
					});

				}
			});
		},
		gap: 200,
		act_opt: null,
		ajax_getSearchData(searchKey,pageID,type,callback){
			//type=3  =>搜人
			//type=2  =>搜微博
			//type=1  =>综合
			// let ajaxData = {
			// 	url:"http://api.weibo.cn/2/cardlist",
			// 	type:"get",
			// 	data:{
			// 		gsid:"_2A256tqyTDeTxGedG7VUS9yzNyDuIHXVX5adbrDV6PUJbrdAKLVSkkWoZtcdLv7aX0KLGmGokV7thOSJkAA..",
			// 		from:"1068093010",
			// 		page:pageID||1,
			// 		count:50,
			// 		c:"iphone",
			// 		s:"fc889bb5",
			// 		// containerid:"230926type="+type+"&q="+searchKey+"&weibo_type%3Dfilter_user",
			// 		containerid:"230926type="+type+"&q="+searchKey+"&weibo_type=people_point&title=名人微博-微博橱窗"
			// 		// containerid:("230926type=1&q="+searchKey+"&t=0page="+pageID||1)
			// 	},
			// 	dataType: 'json',
			// }
			let ajaxData = {
				url:"http://m.weibo.cn/container/getIndex",
				type:"get",
				data:{
					page:pageID||1,
					count:50,
					cardid:"weibo_page",
					uid:1867372137,
					page:pageID||1,
					// containerid:"230926type="+type+"&q="+searchKey+"&weibo_type%3Dfilter_user",
					containerid:"100103type="+type+"&q="+searchKey+"&weibo_type=people_point&title=名人微博-微博橱窗"
					// containerid:("230926type=1&q="+searchKey+"&t=0page="+pageID||1)
				},
				dataType: 'json',
			}
			$.ajax(ajaxData)
			.done(function(e) {
				// console.log(e.replace('"\\','"'));
				callback&&callback(e);
				// console.log(e);
			})
			.fail(function(e) {
				console.log(e);
			})
			.always(function() {
			});

		},
		userSearchData(searchKey,pageID){
			pageID = pageID||1;
			let txt = '',wd;

			wd = window.open();
			let getUser = (searchKey,pageID)=>{
				console.log(pageID);
				sys.ajax_getSearchData(searchKey,(pageID),7,function(e){
					if(e.errmsg){
						console.log(e.errmsg);
						return;
					}
					if(!e.cards[0]&&pageID!=1){
						getUser(searchKey,pageID);
						return;
					}
					let total = e.cardlistInfo.total;
					let data = (e.cards[0].card_group?e.cards[0].card_group:e.cards[1].card_group);
					// console.log(`开始打印第${pageID}页`);
					// txt+=`开始打印第${pageID}页<br>`;
					if(pageID == 1){
						// console.log(`相关数量:${(total==500?'大于500,无法统计':total)}`);
						txt+=`相关数量:${(total==500?'大于500,无法统计':`<span style="color:red">${total}</span>`)}<br>`;
					}
					for (let v of data) {
						// console.log(`昵称: ${v.user.screen_name}  ||  ${v.desc2}  ||  简介：${v.desc1}\n\n`);
						txt+=`昵称: <span style="color:blue;display:inline-block;width:200px;">${v.user.screen_name.replace(searchKey,`<span style="color:#ff5722">${searchKey}</span>`)}</span>    粉丝：<span style="color:red;display:inline-block;width:120px;">${v.desc2.replace('粉丝：','')}</span>    简介：${v.desc1.replace(searchKey,`<span style="color:#ff5722">${searchKey}</span>`)}\n\n<br>`;
					}
					
					if(total>(10*pageID)){

						// console.log(`本页请求打印完毕`);
						// txt+=`本页请求打印完毕<br>`;
						wd.document.querySelector('body').innerHTML = (`正在抓取中....第${pageID+1}页`);
						getUser(searchKey,++pageID);
					}else{
						// console.log("全部数据打印完成");
						txt+="全部数据打印完成<br>";
						wd.document.write(txt);
					}
				});
			}
			getUser(searchKey,pageID)
		},
		people_pointSearchData(searchKey,pageID){
			pageID = pageID||1;
			let txt = '',wd;
			let addFollow = (uid,uName) => {
				console.log(uid)
				let addFollow = {
					url:"http://weibo.com/aj/f/followed?ajwvr=6&__rnd="+new Date().getTime(),
					type:"post",
					data:{
						uid:uid,
						objectid:undefined,
						f:1,
						extra:undefined,
						refer_sort:undefined,
						refer_flag:'1005050001_',
						location:'page_100605_home',
						oid:uid,
						wforce:1,
						nogroup:false,
						fnick:uName,
						refer_lflag:undefined,
						_t:0,
					},
					dataType:"json"

				}
				$.ajax(addFollow)
				.done(function(e) {
					// console.log(e.replace('"\\','"'));
					
					console.log(e);
				})
			}
			wd = window.open();
			let getUser = (searchKey,pageID,index)=>{
				if(index > 3){

					txt+="全部数据打印完成<br>";
					wd.document.write(txt);
				}
				console.log(pageID);
				sys.ajax_getSearchData(searchKey,(pageID),7,function(e){
					if(e.errmsg!==undefined||e.msg!==undefined){
						console.log(e.errmsg||e.msg);
						return;
					}
					if(!e.cards[0]){
						console.log("开始重载"+index)
						getUser(searchKey,pageID,++index);
						return;
					}
					let total = e.cardlistInfo.total;
					let data = e.cards;
					// console.log(`开始打印第${pageID}页`);
					// txt+=`开始打印第${pageID}页<br>`;
					if(pageID == 1){
						// console.log(`相关数量:${(total==500?'大于500,无法统计':total)}`);
						txt+=`相关数量:${(total==500?'大于500,无法统计':`<span style="color:red">${total}</span>`)}<br>`;
					}
					for (let v of data) {
						// console.log(`昵称: ${v.user.screen_name}  ||  ${v.desc2}  ||  简介：${v.desc1}\n\n`);
						txt+=`昵称: <span style="color:blue;display:inline-block;width:200px;">${v.mblog.user.screen_name}(<span style="${v.mblog.user.following?'color:#ff5722':'color:#ccc'}">${v.mblog.user.following?'已关注':'未关注'}</span>)</span>    粉丝：<span style="color:red;display:inline-block;width:120px;">${v.mblog.user.followers_count}</span>    简介：${v.mblog.user.description.replace('taobao',`<span style="color:#ff5722">taobao</span>`)}\n\n<br>`;
						// txt+=`微博内容:${v.mblog.text}<br><br>`;
					}
					// addFollow(data[1].mblog.user.id,data[1].mblog.user.screen_name)
					if(total>(10*pageID)){

						// console.log(`本页请求打印完毕`);
						// txt+=`本页请求打印完毕<br>`;
						wd.document.querySelector('body').innerHTML = (`正在抓取中....第${pageID+1}页`);
						getUser(searchKey,++pageID);
					}else{
						// console.log("全部数据打印完成");
						txt+="全部数据打印完成<br>";
						wd.document.write(txt);
					}
				});
			}
			getUser(searchKey,pageID)
		},
		listener() {
			chrome.tabs.getSelected(null, function(tab) { //首次加载时询问
				chrome.tabs.sendRequest(tab.id, {}, function(data) {
					sys.diverter(data)
				});
			});
			chrome.tabs.onActiveChanged.addListener(function(tabId, selectInfo) { //监听页面标签页变化,变化后询问当前页状态
				chrome.tabs.sendRequest(tabId, {}, function(data) {
					sys.diverter(data)
				});
			})
			chrome.extension.onRequest.addListener(function(data, sender, sendResponse) { //监听别的页面主动发来的数据状况
				sys.diverter(data)
			})
		},
		diverter(data) {
			if (data) {
				if(data.searchKey){
					// sys.userSearchData(data.searchKey);

					// window.open(`http://m.weibo.cn/p/index?containerid=100103type%3D7%26q%3D${data.searchKey}%26weibo_type%3Dpeople_point&title=%E5%90%8D%E4%BA%BA%E5%BE%AE%E5%8D%9A-${data.searchKey}&cardid=weibo_page&uid=1867372137`)
					sys.people_pointSearchData(data.searchKey);
				}
				
			}
		},
	}
	sys.init();

})
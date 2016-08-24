

+function(){
	var sys = {
		init:function(opt){
			console.log('启动中...请稍后')
			// sys.listener();
			return sys;
		},
		getSearchData:function(searchKey,pageID,callback){

			var ajaxData = {
				url:"http://api.weibo.cn/2/cardlist",
				type:"get",
				data:{
					from:"1068093010",
					c:"iphone",
					s:"fc889bb5",
					containerid:("230926type=1&q="+searchKey+"&t=0page="+pageID||1)
				},
				dataType: 'json',
			}
			$.ajax(ajaxData)
			.done(function(e) {
				// console.log(e.replace('"\\','"'));
				console.log(e);
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});

		},
		$ajax:function(opt){
			var config={
				type:'GET',
				url:'',
				success:function(){},
			}
			$.extend(config, opt);
			
			var xhr = new XMLHttpRequest();
			xhr.open(config.type, config.url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if(config.success){
						config.success(xhr.responseText);
					}
				}
			}
			xhr.send();
		},
		listener:function(){

			chrome.extension.sendRequest(sys.userData, function(request) {									//首次加载发送消息
			});
			chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {		//监听发送来的消息
				sendResponse(sys.userData);
			});
		}
	}
	$(function(){
		sys.init();



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


			// addFollow(2035984450,'本小姐的店MissBook')
	})
}()










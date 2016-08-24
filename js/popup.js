


+function(){


	var sys = {
		init:function(){
			sys.listener();
			$textBox = $('#fixed-bg-box .mui-table-view-cell');
			sys.event();
			sys.pullLog();

		},
		blackboard:{

		},
		listener:function(){

			chrome.tabs.getSelected(null, function(tab) {									//首次加载时询问
				chrome.tabs.sendRequest(tab.id, {}, function(data) {
					sys.diverter(data)
				});
			});
			chrome.extension.onRequest.addListener(function(data, sender, sendResponse) { //监听别的页面主动发来的数据状况
				sys.diverter(data)
			})
		},
		diverter:function(d){
			if(!d){
				return;
			}
			if(d.storeID){

				sys.act_opt = d;
				$textBox.find('.storeID').html(d.storeID)
				$textBox.find('.storeName').html(d.storeName)
				$textBox.find('.host').html(d.host)
				$textBox.find('.userListUrl').html(d.userListUrl)
				$textBox.find('.page1_url').html(d.page1_url)
			}
			if(d.type == 'msg'){
				sys.aLog = sys.aLog.concat(d.msg);
			}
		},
		pullLog:function(){
			sys.aLog = [];
			setInterval(function(){
				var msg = sys.aLog.shift()
				if(msg){
					console.log(msg);
					$('.log-box div.blockbard').append('<p>'+msg+'</p>')
				}
			},500)
		},
		event:function(){
			var fn = sys.click_fn;
			$(document).on('click','#GetThisShopData',fn.getShopData);
			$('.va').click(function(){
				if($(this).hasClass('act')){
					$('.log-box').slideUp();
					$(this).removeClass('act');
				}else{
					$('.log-box').slideDown();
					$(this).addClass('act');
				}
			})

		},
		click_fn:{
			getShopData:function(){
				var json = {};
				json.searchKey = $('#searchKey').val();
				chrome.extension.sendRequest(json, function(request) {									//向background.js发送消息

				});
			}
		}

	}
	sys.init();
}()
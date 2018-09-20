const VConsole = require('vconsole');
require('../css/package.scss');
require('../css/style.scss');
require('./play.js');

// const format = require('utils/format');

const vConsole = new VConsole();

var hot = {
    hotUrl : 'https://api.douban.com/v2/book/search?fields=id,title,image,author,publisher,price&count=10&callback=x',
    init : function(){
        const _this = this;
        
        $('.getBtn').on('click', e => {
            e.preventDefault(); 
            // _this.getData();
            _this.queryHot();
        })

        $('.hot .close').on('click', e => {
            $('.hot').hide();
        })
    },
    getData : function(url){
        
        const _this = this;
              
        return new Promise((resolve , reject) => {
            $.ajax({
                url : url,
                type : 'get',
                // dataType : 'jsonp',
                success : function(data){
                    // data = JSON.parse(data);
                    if(!data || data.length == 0) return null;
    
                    // _this.renderHot(data);
                    resolve(data)
                },
                error : function(err){
                    reject(err)
                }
            })
            
        })
        
    },
    renderHot : function(data){
        let _html = '';
        const {books} = data;
        
        if(!books || books.length == 0) return null;
        
        books.map((item,idx) => {
            if(item.title && item.title.length > 0){
                _html += `<p>${idx+1}.${item.title}</p>`
            }
        })

        $('.hot .ct').html(_html);
        $('.hot').show();
    },
    getApiDataFromCache : function(url){
        if('caches' in window){
            return caches.match(url).then(cache => {
                console.log('get data from cache : ',cache)
                if(!cache){
                    return
                }
                return cache.json();
            })
        }else{
            return Promise.resolve();
        }
    },
    queryHot : function(){
        const val = $('.searchinput').val();
        this.hotUrl = `${this.hotUrl}&q=${val}`;

        var _this = this,
              remotePromise = _this.getData(_this.hotUrl);
        
        let cacheData ; 

        _this.getApiDataFromCache(_this.hotUrl).then(data => {
            console.log('cacheData : ' ,data);
            if(data){
                _this.renderHot(data);
            }
            cacheData = data || [];
            return remotePromise
        }).then(data => {
            console.log('all data' , data , _.isEqual(data,cacheData));
            if(!_.isEqual(data,cacheData)){
                _this.renderHot(data)
            }
        })
        
    }
}
// hot.init();

//注册service worker 
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js' , {scope : './'})
    .then(() => {
        console.log('service worker注册成功')
    })
    .catch( err => {
        console.log('service worker注册失败，error:' , err)
    })
}









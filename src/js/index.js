const VConsole = require('vconsole');
require('../css/package.scss');
require('../css/style.scss');
require('./play.js');

// const format = require('utils/format');

const vConsole = new VConsole();

var hot = {
    hotUrl : 'https://wq.jd.com/bases/searchdropdown/getdropdown?key=q',
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
    getData : function(){
        const _this = this;

        return new Promise((resolve , reject) => {
            $.ajax({
                url : _this.hotUrl,
                type : 'get',
                dataType : 'jsonp',
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

        data.map((item,idx) => {
            if(item.keyword && item.keyword.length > 0){
                _html += `<p>${item.keyword}</p>`
            }
        })

        $('.hot .ct').html(_html);
        $('.hot').show();
    },
    getApiDataFromCache : function(){
        const _this = this;
        if('caches' in window){
            return caches.match(_this.hotUrl).then(cache => {
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
        const _this = this,
              remotePromise = _this.getData();
        
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
hot.init();

//注册service worker 
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js?' + Math.random().toString(36).substr(2) , {scope : './'})
    .then(() => {
        console.log('service worker注册成功')
    })
    .catch( err => {
        console.log('service worker注册失败，error:' , err)
    })
}








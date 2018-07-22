const path = require('path'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),       //打包html
      ExtractTextWebpckPlugin = require('extract-text-webpack-plugin'),        //将css拆分出来
      CopyWebpackPlugin = require('copy-webpack-plugin');       //拷贝资源
//less预编译：css-loader less less-loader style-loader
//sass预编译：css-loader sass sass-loader style-loader node-sass
module.exports = {
    entry : './src/js/index.js',
    output : {
        path : path.resolve(__dirname , 'dist'),        //输出文件的目标路径
        filename : 'js/[name].js'
    },
    module : {  //模块相关配置
        rules : [       //解析规则，根据文件后缀提供一个loader
            {
                test : /\.less$/,
                use : ExtractTextWebpckPlugin.extract({
                    fallback : 'style-loader',
                    use : [
                        'css-loader',
                        'less-loader'
                    ]
                })
            },
            {
                test : /\.scss/,
                use : ExtractTextWebpckPlugin.extract({
                    use : [
                        'css-loader?-url&-reduceTransforms',
                        'sass-loader'
                    ]
                })
            },
            {
                test : /\.js$/,
                include : [
                    path.resolve(__dirname , 'src')
                ],
                use : 'babel-loader'
            },{
                test : /\.(png|jpg|gif|jpeg)$/,
                use : [
                    {
                        loader : 'file-loader'
                    }
                ]
            }
        ],
    },
    resolve : {//解析模块的可选项
        extensions : ['.js','.json','.jsx','.less','.css'], //用到文件到扩展名
        alias : {
            utils : path.resolve(__dirname,'src/utils')
        }
    },
    plugins : [ //插件的引用、压缩、分离美化
        new ExtractTextWebpckPlugin('css/[name].css'),
        new CopyWebpackPlugin([
            {
                from : path.resolve(__dirname,'src/img'),
                to : 'img',
                ignore : ['.gitkeep']
            },{
                from : path.resolve(__dirname , 'src/js/service-worker.js'),
                to : path.resolve(__dirname,'dist')
            },{
                from : path.resolve(__dirname , 'src/manifest.json'),
                to : path.resolve(__dirname ,  'dist')
            }
        ]),
        new HtmlWebpackPlugin({ // 将模版的头部和尾部添加css和js模版，dist目录发布到服务器上，项目包。
            file : 'index.html', 
            template : 'src/index.html'
        }),
    ],
    // devServer : {
    //     port : '8081'
    // }
}
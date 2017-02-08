/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    Image,
    TouchableHighlight,
    ActivityIndicator,
    RefreshControl,
    AlertIOS
} from 'react-native';
/*-------------获取屏幕宽高------------------*/
import Dimensions from 'Dimensions';
const {width, height} = Dimensions.get('window');

/*-------------导入第三方组件------------------*/
import Icon from 'react-native-vector-icons/Ionicons';

/*-------------导入其他组件------------------*/
import request from '../common/request';
import config from '../common/config';
import Detail from './Detail';


var cachedResults = {
    nextPage: 1,
    items : [],
    total: 0,
};


export default class index extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            isLoadingTail:false,
            isRefreshing: false
        };

    }

    componentDidMount() {
        this._fetchData(1); //请求数据
    }
    //请求数据实现
    _fetchData(page){
        var $this = this;

        if(page !== 0){
            this.setState({
                isLoadingTail: true
            });
        }
        else {
            this.setState({
                isRefreshing: true
            });
        }


        request.get(config.api.base + config.api.creations,{accessToken:'111',  //拼接请求地址
            page: page
        })
            .then((data) => {
                if(data.success){

                    var items = cachedResults.items.slice();

                    if(page !== 0){
                        items = items.concat(data.data)
                        cachedResults.nextPage += 1;
                    }
                    else {
                        items = data.data.concat(items)
                    }
                    cachedResults.items = items;
                    cachedResults.total = data.total;
                    setTimeout(function () {
                        if(page !== 0){
                            $this.setState({
                                isLoadingTail: false,
                                dataSource: $this.state.dataSource.cloneWithRows(cachedResults.items)
                            })
                        }
                         else {
                            $this.setState({
                                isRefreshing: false,
                                dataSource: $this.state.dataSource.cloneWithRows(cachedResults.items)
                            })
                        }
                    },1000);

                }
                //console.log(data);
            })
            .catch((error) => {
                if(page !== 0){
                    this.setState({
                        isLoadingTail: false
                    })
                }
                else {
                    this.setState({
                        isRefreshing: false,
                    })
                }
                console.error(error);
            });
    }

    //判断是否还有更多数据
    _hasMore() {
        return cachedResults.items.length !== cachedResults.total
    }
    //请求更多数据
    _fetchMoreData(){
        if (!this._hasMore() || this.state.isLoadingTail){
            return
        }

        var page = cachedResults.nextPage;
        this._fetchData(page);
    }
    //底部页面
    _renderFooter() {
        if (!this._hasMore() && cachedResults.total !== 0){
            return(
                <View style={styles.loadingMore}>
                    <Text style={styles.loadingText}>---我是有底线的---</Text>
                </View>
            )
        }
        return <ActivityIndicator style={styles.loadingMore}/>
    }
    //下拉刷新
    _onRefresh() {
        if(!this._hasMore() || this.state.isRefreshing){
            return
        }
        this._fetchData(0);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>列表页面</Text>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}
                    automaticallyAdjustContentInsets={false}  //是否自动调整内容插入
                    enableEmptySections={true}
                    onEndReached={()=>this._fetchMoreData()}  //请求更多数据
                    onEndReachedThreshold={20}
                    showsVerticalScrollIndicator={false} //隐藏滚动条
                    renderFooter={()=>this._renderFooter()}    //底部文字和上拉刷新
                    refreshControl={                        //下拉刷新
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={()=>this._onRefresh()}
                            tintColor='#ff6600'
                            title='Loading...'
                        />
                    }
                />

            </View>
        );
    }



    _renderRow(rowData) {
        return(
            <Item
                key={rowData._id}
                onSelect={()=>this._loadPage()}
                rowData = {rowData}/>
        )
    }
}

class Item extends Component{
    static defaultProps = {
         onSelect : this.props.onSelect
    };
    constructor(props){
        super(props);
        var rowData = this.props.rowData;
        this.state={
            rowData: rowData,
            up: false   //是否被赞过
        }
    }
    _loadPage() {
        this.props.navigator.push({
            name: 'detail',
            component: Detail
        })
    }
    _up() {
        var $this = this;
        var up = !this.state.up;
        var rowData = this.state.rowData;
        var url = config.api.base + config.api.up;

        var body = {
            id: rowData._id,
            up: up ? 'yes' : 'no',
            accessToken: '111'
        };
        request.post(url, body)
            .then(function (data) {
                if(data && data.success){
                    $this.setState({
                        up: up
                    })
                }
                else {
                    AlertIOS.alert('点赞失败,稍后重试')
                }
            })
            .catch(function (error) {
                console.log(error);
                AlertIOS.alert('点赞失败,稍后重试')

            })
    }



    render() {
        var rowData = this.state.rowData;
        return(
            <TouchableHighlight  onPress={this.props.onSelect}>
                <View style={styles.item}>
                    <Text style={styles.title}>{rowData.title}</Text>
                    <Image source={{uri: rowData.thumb}} style={styles.thumb}>
                        <Icon
                            name='ios-play'
                            size={28}
                            style={styles.play}
                        />
                    </Image>
                    <View style={styles.itemFooter}>
                        <View style={styles.handleBox}>
                            <Icon
                                name={this.state.up ? 'ios-heart' : 'ios-heart-outline'}
                                size={28}
                                onPress={()=>this._up()}
                                style={[this.state.up ? styles.up : styles.down]}
                            />
                            <Text style={styles.handleText} onPress={()=>this._up()}>喜欢</Text>
                        </View>
                        <View style={styles.handleBox}>
                            <Icon
                                name='ios-chatboxes-outline'
                                size={28}
                                style={styles.commentIcon}
                            />
                            <Text style={styles.handleText}>评论</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        // paddingBottom: 40
    },
    header: {
        paddingTop:25,
        paddingBottom: 12,
        backgroundColor: '#ee735c',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    item: {
        width: width,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    thumb: {
        width: width,
        height: width*0.56,
        resizeMode: 'cover'
    },
    title: {
        padding:10,
        fontSize: 18,
        color: '#333'
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#eee'
    },
    handleBox: {
        padding: 10,
        flexDirection: 'row',
        width: width/2 - 0.5,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    play: {
        position: 'absolute',
        bottom: 14,
        right: 14,
        width: 46,
        height: 46,
        paddingTop: 9,
        paddingLeft: 18,
        backgroundColor: 'transparent',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 23,
        color: '#ed7b66',

    },
    handleText: {
        paddingLeft: 12,
        fontSize: 18,
        color: '#333'
    },
    down: {
        fontSize: 22,
        color: '#333'
    },
    up: {
        fontSize: 22,
        color: '#ed7b66'
    },
    commentIcon: {
        fontSize: 22,
        color: '#333'
    },
    loadingMore: {
        marginVertical: 10
    },
    loadingText: {
        color: '#777',
        textAlign: 'center'
    }


});


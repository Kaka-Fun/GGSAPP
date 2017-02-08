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
  TabBarIOS,
  Navigator

} from 'react-native';

/*-------------导入外部组件------------------*/
import List from './app/creation/index';
import Edit from './app/edit/index';
import Account from './app/account/index';

/*-------------导入第三方组件------------------*/
import Icon from 'react-native-vector-icons/Ionicons';

export default class GGSAPP extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedTab: 'list'
        }
    }
  render() {
    return (
        <TabBarIOS
            tintColor="#ee735c"
            >
            <Icon.TabBarItem
                iconName="ios-videocam-outline"
                selectedIconName="ios-videocam"
                selected={this.state.selectedTab === 'list'}
                onPress={() => {
                    this.setState({
                        selectedTab: 'list',
                    });
                }}>
                <Navigator
                    initialRoute={{
                        name: 'list',
                        component: List
                    }}
                    configureScene={() => {
                        return Navigator.SceneConfigs.FloatFromRight
                    }}
                    renderScene={(route, navigator) => {let Component = route.component;
                        return <Component {...route.params} navigator = {navigator} />
                    }}
                />
            </Icon.TabBarItem>
            <Icon.TabBarItem

                iconName="ios-recording-outline"
                selectedIconName="ios-recording"
                selected={this.state.selectedTab === 'edit'}
                onPress={() => {
                    this.setState({
                        selectedTab: 'edit',
                    });
                }}>
                <Edit/>
            </Icon.TabBarItem>
            <Icon.TabBarItem

                iconName="ios-more-outline"
                selectedIconName="ios-more"
                selected={this.state.selectedTab === 'account'}
                onPress={() => {
                    this.setState({
                        selectedTab: 'account',
                    });
                }}>
                <Account/>
            </Icon.TabBarItem>
        </TabBarIOS>
    );
  }
}
AppRegistry.registerComponent('GGSAPP', () => GGSAPP);

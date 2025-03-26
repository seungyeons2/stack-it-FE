import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUp1Screen from '../screens/Auth/SignUp1Screen';
import SignUp2Screen from '../screens/Auth/SignUp2Screen';
import SignUp3Screen from '../screens/Auth/SignUp3Screen';
// import SignUp4Screen from './screens/SignUp4Screen';
import FindIdScreen from '../screens/Auth/FindIdScreen';
import FindPasswordScreen from '../screens/Auth/FindPasswordScreen';
import SplashScreen from '../screens/Auth/SplashScreen';
import MainTab from './MainTab';
import StockTradeScreen from '../screens/Main/StockTradeScreen';
//import StockBuying from './src/screens/StockBuying';
//import StockSelling from './src/screens/StockSelling';
import TradingBuyScreen from '../screens/Main/TradingBuyScreen';
import TradingSellScreen from '../screens/Main/TradingSellScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="SignUp1" component={SignUp1Screen}/>
      <Stack.Screen name="SignUp2" component={SignUp2Screen}/>
      <Stack.Screen name="SignUp3" component={SignUp3Screen}/>
      {/* <Stack.Screen name="SignUp4" component={SignUp4Screen}/> */}
      <Stack.Screen name="FindId" component={FindIdScreen}/>
      <Stack.Screen name="FindPassword" component={FindPasswordScreen}/>
      <Stack.Screen name="MainTab" component={MainTab}/>
      <Stack.Screen name="StockTrade" component={StockTradeScreen}/>
      {/* <Stack.Screen name="StockBuying" component={StockBuying} /> */}
      {/* <Stack.Screen name="StockSelling" component={StockSelling} /> */}
      <Stack.Screen name="TradingBuy" component={TradingBuyScreen} />
      <Stack.Screen name="TradingSell" component={TradingSellScreen} />
    </Stack.Navigator>
  );
}
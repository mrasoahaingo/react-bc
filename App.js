import { AuthSession } from 'expo';
import React from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import jwtDecoder from 'jwt-decode';
import BarCodeScanner from './src/components/BarCodeScanner';

/*
  You need to swap out the Auth0 client id and domain with
  the one from your Auth0 client.

  In your Auth0 clent, you need to also add a url to your authorized redirect urls.
  For this application, I added https://auth.expo.io/@community/auth0-example because
  I am signed in as the "community" account on Expo and the slug for this app is "auth0-example".
  You can open this app in the Expo client and check your logs for "Redirect URL (add this to Auth0)"
  to see what URL to add if the above is confusing.

  If you use Facebook through Auth0, be sure to follow this guide: https://auth0.com/docs/connections/social/facebook
*/
const auth0ClientId = 'TggffIx66YM5y6ddv8iJFYtnvbj01kqs';
const auth0Domain = 'https://beautycase-app.eu.auth0.com';

  /**
   * Converts an object to a query string.
   */
function toQueryString(params) {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export default class App extends React.Component {
  state = {
    username: undefined,
  };

  _loginWithAuth0 = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    console.log(`Redirect URL (add this to Auth0): ${redirectUrl}`);
    const result = await AuthSession.startAsync({
      authUrl: `${auth0Domain}/authorize` + toQueryString({
        client_id: auth0ClientId,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUrl,
      }),
    });

    console.log(result);
    if (result.type === 'success') {
      this.handleParams(result.params);
    }
  }

  _loginWithAuth0Twitter = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const result = await AuthSession.startAsync({
      authUrl: `${auth0Domain}/authorize` + toQueryString({
        connection: 'twitter',
        client_id: auth0ClientId,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUrl,
      }),
    });

    console.log(result);
    if (result.type === 'success') {
      this.handleParams(result.params);
    }
  }

  handleParams = async (responseObj) => {
    if (responseObj.error) {
      Alert.alert('Error', responseObj.error_description
        || 'something went wrong while logging in');
      return;
    }
    const response = await fetch('https://beautycase-app.eu.auth0.com/userinfo', {
      headers: {
        'authorization': `Bearer ${responseObj.access_token}`,
        'content-type': 'application/json',
      }
    });
    const result = await response.json();
    if(result.sub) {
      this.setState({
        username: result.sub
      });
    }
  }

  render() {
    return (
      this.state.username !== undefined ?
          <BarCodeScanner /> : <View style={styles.container}>
          <View>
            <Text style={styles.title}>Example: Auth0 login</Text>
            <Button title="Login with Auth0" onPress={this._loginWithAuth0} />
            <Text style={styles.title}>Example: Auth0 force Twitter</Text>
            <Button title="Login with Auth0-Twitter" onPress={this._loginWithAuth0Twitter} />
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#372643',
  },
  logo: {
    width: 190,
    height: 180,
    marginBottom: -2,
    borderRadius: 97,
    backgroundColor: '#372643',
  },
  Vaidik: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    marginLeft: 12,
  },
  talk: {
    fontWeight: 'bold',
    fontSize: 38,
    color: '#fff',
  },
  VaidikTextRootStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  AstrolgersText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'goldenrod',
    textAlign: 'center',
    marginTop: -25,
  },
  AstrolgerText: {
    fontSize: 19,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    marginLeft: 33,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 25,
    right: 15,
  },
});
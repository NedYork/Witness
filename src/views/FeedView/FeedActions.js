import WitnessContract from '../../../build/contracts/Witness.json';
import store from '../../store';
import IPFS  from 'ipfs-mini';
// import loadFeedByBatch from '../../util/feedUtils';

const contract = require('truffle-contract');

const ipfs = new IPFS({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});

// export const LOADING_FEED = 'LOADING_FEED'
// function loadingFeed() {
//   return {
//     type: LOADING_FEED
//   }
// }

export const LOAD_FEED_SUCCESS = 'LOAD_FEED_SUCCESS'
function feedSuccessfullyLoaded(feed) {
  return {
    type: LOAD_FEED_SUCCESS,
    payload: feed,
  }
}

export function loadFeed() {
  let web3 = store.getState().web3.web3Instance;
  if (typeof web3 !== 'undefined') {
    return (dispatch) => {
      const cont = contract(WitnessContract);
      cont.setProvider(web3.currentProvider);

      cont.deployed().then(async (instance) => {
        const lastPostId = await instance.lastPostId();
        let res = [];

        for (let i = lastPostId.c[0] - 1; i >= 0; i--) {
          const post = await instance.returnPost(i);
          const username = await instance.returnUsername(post[0]);
          ipfs.cat(post[1], (err, data) => {
            if (err) {
              return console.log(err);
            }
            res.push({username, body: data, timestamp: post[2]});
          });
        }
        dispatch(feedSuccessfullyLoaded(res));
      })
      .catch(err => {
        console.error(err);
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}

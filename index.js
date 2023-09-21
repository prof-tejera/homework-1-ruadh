import fetch from 'node-fetch';
// Recommend using node-fetch for those familiar with JS fetch

const COLORS = 'https://nt-cdn.s3.amazonaws.com/colors.json';

/**
 * @param name filter for color name
 * @param hex filter for color hex code
 * @param compName filter for complementary color name
 * @param compHex filter for complementary color hex code
 * @returns Promise
 */
const fetchColors = ({ name, hex, compName, compHex }) => {

  // Gather the arguments and reduce to the provided criterion 
  /* Note: I was going to use the spread operator here to avoid hard-coding the key names, but as I mentioned on Slack, 
  any use of "..." (including samples from the es6-primer) with the provided HW1 starter files gives me an Unexpected token error, 
  even though the same code runs in other contexts. */
  const criteria = { "name": name, "hex": hex, "compName": compName, "compHex": compHex };
  for (let key in criteria) {
    if (criteria[key] === undefined) {
      delete criteria[key];
    }
  }
  const criterion = Object.keys(criteria)[0];     // Spec says we can assume only 1 criterion, but just to be safe, pull the first
  const value = criteria[criterion];

  // Helper function for applying our search criteria
  /**
 * @param key the key we're searching:  hex, name, compHex, or compName
 * @param value the value we're looking to match
 * @returns boolean
 */
  const matchKey = (key, val) => {
    return (el) => {
      if (key == "hex") {                                         // Hex code is an exact match
        return el[key] === val;
      } else if (key == "name") {                                 // Color name is a case-insensitive partial match
        const regex = new RegExp(val, "i");
        return !!el[key].match(regex);
      } else if (key == "compHex") {                              // Hex code of any of the comp elements is an exact match
        return el.comp.filter(matchKey("hex", val)).length > 0;
      } else if (key == "compName") {                             // Name of any of the comp elements is a partial case-insensitive match
        return el.comp.filter(matchKey("name", val)).length > 0;
      }
    }
  };


  // Retrieve the colors list from our source
  return fetch(COLORS)

    // Once it's received, convert it to a JSON object
    .then(r => r.json())
    .then(r => {
      // Return a promise with a response containing only the elements that match our search criterion
      return new Promise((resolve, reject) => {
        resolve(r.filter(matchKey(criterion, value)));
      })
    });
};

// Leave this here
export default fetchColors;

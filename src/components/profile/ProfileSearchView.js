import React from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
// import { Link, Redirect } from 'react-router-dom';
// //import { connect } from 'react-redux';
// //import { getAllUsers } from '../../actions/auth'
// import Topbar from './Topbar';

// import Sidebar from './Sidebar';
// import Footer from './Footer';

// import Alert from '../layout/Alert';

// const ProfileSearchView = () => {
//   return (
//     <Fragment>
//       <div id="wrapper">
//                 <Sidebar />
//                 <div id="content-wrapper" className="d-flex flex-column">
//                     <div id="content">
//                         <Topbar />
//                         <Alert />
                        
//                     </div>
//                     <Footer />
//                 </div> 
//             </div>
//     </Fragment>
//   )
// }

// export default ProfileSearchView
const people = [
  {
    first: 'Charlie',
    last: 'Brown',
    twitter: 'dancounsell'
  },
  {
    first: 'Charlotte',
    last: 'White',
    twitter: 'mtnmissy'
  },
  {
    first: 'Chloe',
    last: 'Jones',
    twitter: 'ladylexy'
  },
  {
    first: 'Cooper',
    last: 'King',
    twitter: 'steveodom'
  }
];

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value) {
  const escapedValue = escapeRegexCharacters(value.trim());
  
  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('\\b' + escapedValue, 'i');
  
  return people.filter(person => regex.test(getSuggestionValue(person)));
}

function getSuggestionValue(suggestion) {
  return `${suggestion.first} ${suggestion.last}`;
}

function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.first} ${suggestion.last}`;
  const matches = AutosuggestHighlightMatch(suggestionText, query);
  const parts = AutosuggestHighlightParse(suggestionText, matches);

  return (
    <span className={'suggestion-content ' + suggestion.twitter}>
      <span className="name">
        {
          parts.map((part, index) => {
            const className = part.highlight ? 'highlight' : null;

            return (
              <span className={className} key={index}>{part.text}</span>
            );
          })
        }
      </span>
    </span>
  );
}

class ProfileSearchView extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: []
    };    
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Type 'c'",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps} />
    );
  }
}
export default ProfileSearchView;
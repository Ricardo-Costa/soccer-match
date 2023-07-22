import './assets/styles.scss';
import 'animate.css';

const fieldMaps = {
  columns: 61,
  rows: 30
}

const goalsMaps = {
  fieldLeft: [ 540, 510, 480, 450 ],
  fieldRight: [ 421, 511, 481, 451 ],
}

const App = () => {

  const renderFieldBlocks = () => {
    const content = [];
    // let counterColumns = fieldMaps.columns;
    // let counterRows = fieldMaps.rows;

    for (let counterColumns = 1; counterColumns <= fieldMaps.columns; counterColumns++) {
      for (let counterRows = 1; counterRows <= fieldMaps.rows; counterRows++) {
        content.push(
          // <div className="field-block"></div>
          <div className="field-block">{ counterColumns +'-'+ counterRows }</div>
          // <div className={ goalsMaps.fieldRight.includes(counter) ? "field-block field-block-goal" : "field-block"
          // }>{counter}</div>
        );
      }
    }


    return content;
  }

  return (
    <div className="full-content">
      <div className="field">{ renderFieldBlocks() }</div>
    </div>
  );
}

export default App;

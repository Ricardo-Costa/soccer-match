import './assets/styles.scss';
import 'animate.css';
import { useEffect, useState } from 'react';

const fieldMaps = {
  columns: 31,
  rows: 15
}

const goalsMaps = {
  fieldLeft: [ 540, 510, 480, 450 ],
  fieldRight: [ 421, 511, 481, 451 ],
}

interface IBlockComponent
{
  className: string
  id: string
}

const App = () => {

  const [ blocks, setBlocks ] = useState<Array<IBlockComponent>>([]);

  const renderFieldBlocks = () => {
    const content = [];
    let key = '';
    for (let counterColumns = 1; counterColumns <= fieldMaps.columns; counterColumns++) {
      for (let counterRows = 1; counterRows <= fieldMaps.rows; counterRows++) {
        key = `${counterColumns}-${counterRows}`;
        content.push(
          // <div className="field-block"></div>
          <div key={key} className="field-block">{key}</div>
          // <div className={ goalsMaps.fieldRight.includes(counter) ? "field-block field-block-goal" : "field-block"
          // }>{counter}</div>
        );
      }
    }


    return content;
  }

  // useEffect(() => {

  //   const blockContents = [];
  //   let key = '';
  //   for (let counterColumns = 1; counterColumns <= fieldMaps.columns; counterColumns++) {
  //     for (let counterRows = 1; counterRows <= fieldMaps.rows; counterRows++) {
  //       key = `c${counterColumns}-r${counterRows}`;
  //       blockContents.push(
  //         {
  //           className: 'field-block',
  //           id: key
  //         } as IBlockComponent
  //       );
  //     }
  //   }

  //   setBlocks(blockContents);

  // }, []);

  return (
    <div className="full-content">
      {/* <div className="field">{ renderFieldBlocks() }</div> */}
      <div className="field">
        {
          blocks.map((block: IBlockComponent) => {
            return (
              // <div className="field-block"></div>
              <div key={block.id} className={block.className}>{block.id}</div>
              // <div className={ goalsMaps.fieldRight.includes(counter) ? "field-block field-block-goal" : "field-block"
              // }>{counter}</div>
            )
          })
        }
      </div>
    </div>
  );
}

export default App;

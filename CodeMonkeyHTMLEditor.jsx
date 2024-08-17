import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faAlignLeft, faAlignRight, faAlignCenter, faQuoteRight, faEraser } from '@fortawesome/free-solid-svg-icons';
import { faTable, faTableColumns, faTableList, faCirclePlus, faCircleMinus, faImage, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import './CodeMonkeyHTMLEditor.css';

const CodeMonkeyHTMLEditor = ({ onContentChange }) => {
  const [editorContent, setEditorContent] = useState('');
  const [showRawHTML, setShowRawHTML] = useState(false);
  const previewRef = useRef(null);

  // useEffect(() => {
  //   fetch('/source.html')
  //     .then(response => response.text())
  //     .then(data => {
  //       setEditorContent(data);
  //       if (previewRef.current) {
  //         previewRef.current.innerHTML = data;
  //       }
  //     })
  //     .catch(error => console.error('Error fetching the source file:', error));
  // }, []);

             const handlePreviewInput = (e) => {
              const selection = window.getSelection();
              const range = selection.getRangeAt(0);
              const preCaretRange = range.cloneRange();
              preCaretRange.selectNodeContents(previewRef.current);
              preCaretRange.setEnd(range.endContainer, range.endOffset);
              const cursorPosition = preCaretRange.toString().length;
            
              setEditorContent(previewRef.current.innerHTML);
              // provide data to parent component
              if (onContentChange) {
                onContentChange(previewRef.current.innerHTML);
              }
            
            
              setTimeout(() => {
                const newRange = document.createRange();
                const newSelection = window.getSelection();
                let charCount = 0;
                let node = null;
            
                const traverseNodes = (nodes) => {
                  for (let i = 0; i < nodes.length; i++) {
                    const childNode = nodes[i];
                    const textContentLength = childNode.textContent.length;
                    if (charCount + textContentLength >= cursorPosition) {
                      node = childNode;
                      break;
                    }
                    charCount += textContentLength;
                  }
                };
            
                traverseNodes(previewRef.current.childNodes);
            
                // console.log('Cursor Position:', cursorPosition);
                // console.log('Node:', node);
                // console.log('Char Count:', charCount);
            
                try {
                  if (node) {
                    const offset = Math.min(cursorPosition - charCount, node.textContent.length);
                    // console.log('Offset:', offset);
                    newRange.setStart(node, offset);
                    newRange.collapse(true);
                    newSelection.removeAllRanges();
                    newSelection.addRange(newRange);
                  } else {
                    newRange.setStart(previewRef.current, previewRef.current.childNodes.length);
                    newRange.collapse(true);
                    newSelection.removeAllRanges();
                    newSelection.addRange(newRange);
                  }
                } catch (error) {
                  // console.log('This error is expected behaviour: Error setting range:', error);
                }
              }, 0);
            };
            
            const handleEditorChange = (e) => {
              const cursorPosition = e.target.selectionStart;
              setEditorContent(e.target.value);
              if (previewRef.current) {
                previewRef.current.innerHTML = e.target.value;
                setTimeout(() => {
                  const range = document.createRange();
                  const selection = window.getSelection();
                  let charCount = 0;
                  let node = null;
            
                  const traverseNodes = (nodes) => {
                    for (let i = 0; i < nodes.length; i++) {
                      const childNode = nodes[i];
                      const textContentLength = childNode.textContent.length;
                      if (charCount + textContentLength >= cursorPosition) {
                        node = childNode;
                        break;
                      }
                      charCount += textContentLength;
                    }
                  };
            
                  traverseNodes(previewRef.current.childNodes);
            
                  // console.log('Cursor Position:', cursorPosition);
                  // console.log('Node:', node);
                  // console.log('Char Count:', charCount);
                
                try {
                  if (node) {
                    const offset = cursorPosition - charCount;
                    // console.log('Offset:', offset);
                    if (offset <= node.textContent.length) {
                      range.setStart(node, offset);
                      range.collapse(true);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    } else {
                      range.setStart(node, node.textContent.length);
                      range.collapse(true);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    }
                  } else {
                    range.setStart(previewRef.current, previewRef.current.childNodes.length);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                } catch (error) {
                  // console.log('This error is expected behaviour: Error setting range:', error);
                }
                }, 0);
              }
            };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('h')) {
      execCommand('formatBlock', value);
      return;
    } 
    if (value.startsWith('p')) {
      execCommand('formatBlock', '<p>');
      return;
    }
    if (value==='1' || value==='3' || value==='5') {
      execCommand('fontSize', value);
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    execCommand('foreColor', color);
  };

  const insertTable = () => {
    execCommand('insertHTML', 
  `
      <table border="1">
        <tbody>
        <tr>
          <td>New Cell</td><td>New Cell</td>
        </tr>
        <tr>
          <td>New Cell</td><td>New Cell</td>
        </tr>
        <tr>
         <td>New Cell</td><td>New Cell</td>
        </tr>
        </tbody>
      </table>
    `);
  }

  const getSelectedTable = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).startContainer;
      while (node) {
        if (node.nodeName === 'TABLE') {
          return node;
        }
        node = node.parentNode;
      }
    }
    return null;
  };

  const handleTableBorder = (e) => {
    const value = e.target.value;
    const table = getSelectedTable();
    if (table) {
      table.setAttribute('border', value);
    }
    e.target.value = '';
  };
    
  const insertRow = () => {
    const table = getSelectedTable();
    if (!table) {
      alert('Please place the cursor inside a table to add a row.');
      return;
    }
    const row = table.insertRow();
    for (let i = 0; i < table.rows[0].cells.length; i++) {
      const cell = row.insertCell();
      cell.textContent = 'New Cell';
    }
  };
  
  const deleteRow = () => {
    const table = getSelectedTable();
    if (!table) {
      alert('Please place the cursor inside a table to delete a row.');
      return;
    }
    if (table.rows.length > 1) {
      table.deleteRow(-1);
    } else {
      alert('Cannot delete the last row.');
    }
  };
  
  const insertColumn = () => {
    const table = getSelectedTable();
    if (!table) {
      alert('Please place the cursor inside a table to add a column.');
      return;
    }
    for (let i = 0; i < table.rows.length; i++) {
      const cell = table.rows[i].insertCell();
      cell.textContent = 'New Cell';
    }
  };
  
  const deleteColumn = () => {
    const table = getSelectedTable();
    if (!table) {
      alert('Please place the cursor inside a table to delete a column.');
      return;
    }
    if (table.rows[0].cells.length > 1) {
      for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].deleteCell(-1);
      }
    } else {
      alert('Cannot delete the last column.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        insertImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

const insertImage = (base64String) => {
  const editor = document.getElementById('preview'); // Ensure this ID matches your editor element
  if (!editor) {
    console.error('Editor element not found');
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  
  const img = document.createElement('img');
  img.src = base64String;
  img.style.cursor = 'pointer';
  img.addEventListener('click', handleImageClick);
  
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '10'; // Minimum width
  input.max = '1000'; // Maximum width, adjust as needed
  input.style.width = '150px';
  input.style.marginRight = '10px';
  
  // Set the slider value after the image has loaded
  img.onload = () => {
    input.value = img.width;
    input.max = img.naturalWidth; // Set max to the natural width of the image
  };

  // Add event listener to change image width when slider value changes
  input.addEventListener('input', () => {
    const newWidth = parseInt(input.value, 10);
    if (!isNaN(newWidth) && newWidth > 0) {
      img.width = newWidth;
    }
  });

  // Create alignment buttons with FontAwesome icons
  const createButton = (iconClass, alignment) => {
    const button = document.createElement('button');
    button.innerHTML = `<i class="${iconClass}"></i>`;
    button.style.marginLeft = '5px';
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.fontSize = '20px'; // Increase font size
    button.style.padding = '5px'; // Add padding
    button.style.color = '#000'; // Ensure the icon color is visible
    button.addEventListener('click', () => {
      if (alignment === 'delete') {
        wrapper.remove(); // Remove the wrapper, which contains the controlContainer and the image
      } else {
        img.style.display = 'block';
        img.style.marginLeft = alignment === 'left' ? '0' : alignment === 'center' ? 'auto' : 'auto';
        img.style.marginRight = alignment === 'right' ? '0' : alignment === 'center' ? 'auto' : 'auto';
      }
    });
    return button;
  };

  const leftButton = createButton('fas fa-align-left', 'left');
  const centerButton = createButton('fas fa-align-center', 'center');
  const rightButton = createButton('fas fa-align-right', 'right');
  const deleteButton = createButton('fas fa-trash-alt', 'delete');

  // Create a container for the slider and buttons
  const controlContainer = document.createElement('div');
  controlContainer.style.display = 'flex';
  controlContainer.style.alignItems = 'center';
  controlContainer.style.background = 'rgba(255, 255, 255, 0.7)';
  controlContainer.style.border = '1px solid #000000';
  controlContainer.style.padding = '10px';
  controlContainer.style.borderRadius = '5px';
  controlContainer.style.marginBottom = '10px';
  controlContainer.style.marginTop = '10px';

  // Append slider and buttons to the control container
  controlContainer.appendChild(leftButton);
  controlContainer.appendChild(centerButton);
  controlContainer.appendChild(rightButton);
  controlContainer.appendChild(input);
  controlContainer.appendChild(deleteButton);

  // Append elements to the wrapper
  wrapper.appendChild(controlContainer);
  wrapper.appendChild(img);

  // Insert the wrapper at the cursor position
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Check if the container is inside a table cell
    if (container.nodeType === Node.TEXT_NODE) {
      const parentElement = container.parentElement;
      if (parentElement && parentElement.tagName === 'TD') {
        parentElement.appendChild(wrapper);
      } else {
        range.deleteContents(); // Optional: remove any selected content
        range.insertNode(wrapper);
      }
    } else {
      range.deleteContents(); // Optional: remove any selected content
      range.insertNode(wrapper);
    }
  } else {
    // Fallback: append to the end if no selection
    editor.appendChild(wrapper);
  }
};

const handleImageClick = (e) => {
  const image = e.target;
  console.log('Image clicked: ', image, " Height: ", image.height, " Width: ", image.width);
};

  const triggerFileInput = () => {
    document.getElementById('hiddenFileInput').click();
  };

  return (
    <>
{/* Hidden file input */}
<input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        id="hiddenFileInput"
        style={{ display: 'none' }}
/>
    
    {/*  -----------------Toolbar-----------------  */}

    <div id="toolbar" className="toolbar">
      <button onClick={() => execCommand('bold')} title="Bold"><FontAwesomeIcon icon={faBold} /></button>
      <button onClick={() => execCommand('italic')} title="Italic"><FontAwesomeIcon icon={faItalic} /></button>
      <button onClick={() => execCommand('underline')} title="Underline"><FontAwesomeIcon icon={faUnderline} /></button>
      <button onClick={() => execCommand('justifyLeft')} title="Align Left"><FontAwesomeIcon icon={faAlignLeft} /></button>
      <button onClick={() => execCommand('justifyCenter')} title="Align Center"><FontAwesomeIcon icon={faAlignCenter} /></button>
      <button onClick={() => execCommand('justifyRight')} title="Align Right"><FontAwesomeIcon icon={faAlignRight} /></button>
      <button onClick={() => execCommand('formatBlock', 'blockquote')} title="Blockquote"><FontAwesomeIcon icon={faQuoteRight} /></button>
      <select onChange={handleDropdownChange} title="Select Style">
        <option value="">Select Style</option>
        <option value="p">Paragraph</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="5">Large</option>
      </select>
      <input type="color" onChange={handleColorChange} title="Choose text color" />
      <button onClick={() => execCommand('removeFormat')} title="Remove Format"><FontAwesomeIcon icon={faEraser} /></button>
      <button onClick={triggerFileInput} title="Insert Image"><FontAwesomeIcon icon={faImage} /></button>
      <button onClick={() => insertTable()} title="Insert Table"><FontAwesomeIcon icon={faTable} /></button>
      <button onClick={() => insertRow()} title="Insert Row">
        <span className="fa-stack">
          <FontAwesomeIcon icon={faTableList} className="fa-stack-1x" />
          <FontAwesomeIcon icon={faCirclePlus} className="fa-stack-1x fa-small" style={{ color: 'green' }} />
        </span>
      </button>
      <button onClick={() => deleteRow()} title="Delete Row">
        <span className="fa-stack">
          <FontAwesomeIcon icon={faTableList} className="fa-stack-1x" />
          <FontAwesomeIcon icon={faCircleMinus} className="fa-stack-1x fa-small" style={{ color: 'red' }} />
        </span>
      </button>
      <button onClick={() => insertColumn()} title="Insert Column">
        <span className="fa-stack">
          <FontAwesomeIcon icon={faTableColumns} className="fa-stack-1x" />
          <FontAwesomeIcon icon={faCirclePlus} className="fa-stack-1x fa-small" style={{ color: 'green' }} />
        </span>
      </button>
      <button onClick={() => deleteColumn()} title="Delete Column">
        <span className="fa-stack">
          <FontAwesomeIcon icon={faTableColumns} className="fa-stack-1x" />
          <FontAwesomeIcon icon={faCircleMinus} className="fa-stack-1x fa-small" style={{ color: 'red' }} />
        </span>
      </button>
      <select onChange={handleTableBorder} title="Table Border">
        <option value="">Border</option>
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
      </select>
      <button onClick={() => setShowRawHTML(!showRawHTML)} title={showRawHTML ? 'See just the nice things' : 'See & Edit Raw HTML'}>
        {showRawHTML ? 'Hide HTML' : 'Show HTML'}
      </button>
      
    </div>


    {/* -----------------Editor----------------- */}

      <div className="editor">
        {showRawHTML && (
          <textarea
            id="editor"
            name="editor"
            rows="10"
            value={editorContent}
            onChange={handleEditorChange}
            style={{ width: '100%' }}
          />
        )}
          <div
            id="preview"
            className="preview"
            contentEditable
            onInput={handlePreviewInput}
            ref={previewRef}
          >
          </div>
      </div>
    </>
  );
}

export default CodeMonkeyHTMLEditor;
import { useState, useRef, useEffect } from 'react';
import { Calculator, X, Minus, Moon, Sun, GripHorizontal, History, Copy, Check, Trash2, Home, User, Settings } from 'lucide-react';

// Calculator Component
function FloatingCalculator({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose,
  showTriggerButton = true 
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose !== undefined 
    ? (value) => { if (!value) externalOnClose(); }
    : setInternalIsOpen;
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [memory, setMemory] = useState(0);
  const [showPercentageMode, setShowPercentageMode] = useState(false);
  
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef(null);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    
    setIsDragging(true);
    const rect = calculatorRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        const maxX = window.innerWidth - (calculatorRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (calculatorRef.current?.offsetHeight || 0);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        snapToEdge();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isMinimized) return;

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      e.preventDefault();

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key));
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        performOperation('÷');
      } else if (e.key === '%') {
        performOperation('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape') {
        clear();
      } else if (e.key === 'Backspace') {
        deleteLastDigit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, display, previousValue, operation, waitingForOperand]);

  const snapToEdge = () => {
    const threshold = 50;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const calcWidth = calculatorRef.current?.offsetWidth || 0;
    const calcHeight = calculatorRef.current?.offsetHeight || 0;

    let newX = position.x;
    let newY = position.y;

    if (position.x < threshold) newX = 20;
    if (position.x > windowWidth - calcWidth - threshold) newX = windowWidth - calcWidth - 20;
    if (position.y < threshold) newY = 20;
    if (position.y > windowHeight - calcHeight - threshold) newY = windowHeight - calcHeight - 20;

    setPosition({ x: newX, y: newY });
  };

  // Calculator logic
  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setExpression(expression + digit);
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === '0' ? String(digit) : display + digit;
      setDisplay(newDisplay);
      
      if (operation) {
        const parts = expression.split(/[+\-×÷%]/);
        const withoutLast = expression.substring(0, expression.lastIndexOf(parts[parts.length - 1]));
        setExpression(withoutLast + newDisplay);
      } else {
        setExpression(newDisplay);
      }
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setExpression(expression + '0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      const newDisplay = display + '.';
      setDisplay(newDisplay);
      
      if (operation) {
        const parts = expression.split(/[+\-×÷%]/);
        const withoutLast = expression.substring(0, expression.lastIndexOf(parts[parts.length - 1]));
        setExpression(withoutLast + newDisplay);
      } else {
        setExpression(newDisplay);
      }
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const deleteLastDigit = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      
      if (operation) {
        const parts = expression.split(/[+\-×÷%]/);
        const withoutLast = expression.substring(0, expression.lastIndexOf(parts[parts.length - 1]));
        setExpression(withoutLast + newDisplay);
      } else {
        setExpression(newDisplay);
      }
    } else {
      setDisplay('0');
      if (!operation) {
        setExpression('');
      }
    }
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(display + ' ' + nextOperation + ' ');
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
        case '%':
          newValue = currentValue % inputValue;
          break;
        default:
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setExpression(String(newValue) + ' ' + nextOperation + ' ');
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = previousValue || 0;
      let result = currentValue;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        case '%':
          result = currentValue % inputValue;
          break;
        default:
          break;
      }

      const calculation = expression + ' = ' + result;
      setDisplay(String(result));
      setExpression(calculation);
      
      // Add to history
      setHistory(prev => [{
        expression: calculation,
        result: String(result),
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  // Memory functions
  const memoryAdd = () => {
    setMemory(prev => prev + parseFloat(display));
  };

  const memorySubtract = () => {
    setMemory(prev => prev - parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setExpression(String(memory));
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Percentage helpers
  const scoreToPercentage = () => {
    const parts = display.split('/');
    if (parts.length === 2) {
      const score = parseFloat(parts[0]);
      const total = parseFloat(parts[1]);
      const percentage = (score / total * 100).toFixed(2);
      setDisplay(percentage);
      setExpression(`${score}/${total} = ${percentage}%`);
      setHistory(prev => [{
        expression: `${score}/${total} = ${percentage}%`,
        result: percentage + '%',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
    }
  };

  const percentageOf = () => {
    if (previousValue !== null) {
      const percentage = parseFloat(display);
      const result = (previousValue * percentage / 100).toFixed(2);
      setDisplay(result);
      setExpression(`${percentage}% of ${previousValue} = ${result}`);
      setHistory(prev => [{
        expression: `${percentage}% of ${previousValue} = ${result}`,
        result: String(result),
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  };

  const addPercentage = () => {
    if (previousValue !== null) {
      const percentage = parseFloat(display);
      const result = (previousValue + (previousValue * percentage / 100)).toFixed(2);
      setDisplay(result);
      setExpression(`${previousValue} + ${percentage}% = ${result}`);
      setHistory(prev => [{
        expression: `${previousValue} + ${percentage}% = ${result}`,
        result: String(result),
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  };

  const Button = ({ children, onClick, className = '', variant = 'default' }) => {
    const baseStyles = `no-drag h-12 rounded-lg font-semibold text-base transition-all duration-150 active:scale-95 ${
      isDarkMode ? 'text-white' : 'text-gray-800'
    }`;
    
    const variants = {
      default: isDarkMode 
        ? 'bg-gray-700 hover:bg-gray-600' 
        : 'bg-gray-100 hover:bg-gray-200',
      operator: isDarkMode
        ? 'bg-blue-600 hover:bg-blue-500 text-white'
        : 'bg-blue-500 hover:bg-blue-600 text-white',
      equals: isDarkMode
        ? 'bg-green-600 hover:bg-green-500 text-white'
        : 'bg-green-500 hover:bg-green-600 text-white',
      clear: isDarkMode
        ? 'bg-red-600 hover:bg-red-500 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white',
      memory: isDarkMode
        ? 'bg-purple-600 hover:bg-purple-500 text-white'
        : 'bg-purple-500 hover:bg-purple-600 text-white',
      small: isDarkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-xs' 
        : 'bg-gray-100 hover:bg-gray-200 text-xs'
    };

    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  if (!isOpen && showTriggerButton) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
      >
        <Calculator size={24} />
      </button>
    );
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-40" />
      )}

      <div
        ref={calculatorRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        className={`fixed z-50 transition-all duration-300 ${
          isDragging ? 'shadow-2xl cursor-grabbing' : 'shadow-lg cursor-default'
        }`}
      >
        <div
          className={`w-96 rounded-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } ${isOpen ? 'animate-in fade-in slide-in-from-bottom-4 duration-300' : ''}`}
        >
          {/* Header */}
          <div
            onMouseDown={handleMouseDown}
            className={`flex items-center justify-between p-3 cursor-grab active:cursor-grabbing ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Calculator
              </span>
              {memory !== 0 && (
                <span className="text-xs px-2 py-1 rounded bg-purple-500 text-white font-semibold">
                  M: {memory}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`no-drag p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                } ${showHistory ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
              >
                <History size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`no-drag p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-gray-600" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={`no-drag p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <Minus size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`no-drag p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <X size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Calculator Body */}
          {!isMinimized && (
            <div className="flex">
              {/* Main Calculator */}
              <div className="flex-1 p-4">
                {/* Display */}
                <div className={`mb-3 p-3 rounded-xl ${
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                }`}>
                  <div className={`text-right text-sm mb-2 h-5 overflow-hidden text-ellipsis ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {expression || '\u00A0'}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex-1 text-right text-2xl font-bold overflow-hidden text-ellipsis ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {display}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className={`no-drag p-1.5 rounded transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                      }`}
                    >
                      {copied ? 
                        <Check size={16} className="text-green-500" /> : 
                        <Copy size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                      }
                    </button>
                  </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setShowPercentageMode(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      !showPercentageMode 
                        ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setShowPercentageMode(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      showPercentageMode 
                        ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                    }`}
                  >
                    % Helper
                  </button>
                </div>

                {!showPercentageMode ? (
                  <>
                    {/* Memory Functions */}
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      <Button onClick={memoryClear} variant="small">MC</Button>
                      <Button onClick={memoryRecall} variant="small">MR</Button>
                      <Button onClick={memoryAdd} variant="small">M+</Button>
                      <Button onClick={memorySubtract} variant="small">M-</Button>
                    </div>

                    {/* Standard Buttons Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      <Button onClick={clear} variant="clear" className="col-span-2">AC</Button>
                      <Button onClick={deleteLastDigit} variant="operator">DEL</Button>
                      <Button onClick={() => performOperation('÷')} variant="operator">÷</Button>

                      <Button onClick={() => inputDigit(7)}>7</Button>
                      <Button onClick={() => inputDigit(8)}>8</Button>
                      <Button onClick={() => inputDigit(9)}>9</Button>
                      <Button onClick={() => performOperation('×')} variant="operator">×</Button>

                      <Button onClick={() => inputDigit(4)}>4</Button>
                      <Button onClick={() => inputDigit(5)}>5</Button>
                      <Button onClick={() => inputDigit(6)}>6</Button>
                      <Button onClick={() => performOperation('-')} variant="operator">−</Button>

                      <Button onClick={() => inputDigit(1)}>1</Button>
                      <Button onClick={() => inputDigit(2)}>2</Button>
                      <Button onClick={() => inputDigit(3)}>3</Button>
                      <Button onClick={() => performOperation('+')} variant="operator">+</Button>

                      <Button onClick={() => inputDigit(0)} className="col-span-2">0</Button>
                      <Button onClick={inputDecimal}>.</Button>
                      <Button onClick={handleEquals} variant="equals">=</Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
                      <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Score to %: Enter as 45/50 then click
                      </p>
                      <Button onClick={scoreToPercentage} variant="operator" className="w-full">
                        Score → %
                      </Button>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
                      <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        % of number: Enter number, press this, enter %
                      </p>
                      <Button onClick={() => {setPreviousValue(parseFloat(display)); setWaitingForOperand(true);}} variant="operator" className="w-full mb-2">
                        Set Base Number
                      </Button>
                      <Button onClick={percentageOf} variant="equals" className="w-full">
                        Calculate % of Base
                      </Button>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
                      <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Add %: Enter number, press this, enter %
                      </p>
                      <Button onClick={() => {setPreviousValue(parseFloat(display)); setWaitingForOperand(true);}} variant="operator" className="w-full mb-2">
                        Set Base Number
                      </Button>
                      <Button onClick={addPercentage} variant="equals" className="w-full">
                        Add % to Base
                      </Button>
                    </div>

                    <Button onClick={() => setShowPercentageMode(false)} className="w-full">
                      Back to Standard
                    </Button>
                  </div>
                )}

                {/* Keyboard hint */}
                <div className={`mt-3 text-xs text-center ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Keyboard supported • ESC to clear
                </div>
              </div>

              {/* History Panel */}
              {showHistory && (
                <div className={`w-64 border-l ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      History
                    </h3>
                    {history.length > 0 && (
                      <button
                        onClick={() => setHistory([])}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        }`}
                      >
                        <Trash2 size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className={`text-xs text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No calculations yet
                      </p>
                    ) : (
                      history.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setDisplay(item.result);
                            setExpression(item.result);
                            setWaitingForOperand(true);
                          }}
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-words`}>
                            {item.expression}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.timestamp}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Export the calculator component directly
export default FloatingCalculator;
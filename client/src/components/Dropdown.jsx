import {useEffect, useRef, useState} from "react";
import './Dropdown.scss';

const Dropdown = ({value, options, onChange, placeholder = 'Выбрать', colorByValue = false}) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }

    function handleSelect(optionValue) {
        onChange(optionValue);
        setIsOpen(false);
    }

    const selectedOption = options.find(o => o.value === value);

    return (
        <div
            className="dropdown"
            ref={rootRef}
            tabIndex={0}
            onClick={() => setIsOpen(prev => !prev)}
            onKeyDown={handleKeyDown}
        >
            <div className="dropdown__control">
                <span className={`dropdown__value ${!selectedOption ? 'dropdown__value--placeholder' : ''} ${colorByValue && selectedOption ? `dropdown__value--${selectedOption.value}` : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={`dropdown__arrow ${isOpen ? 'dropdown__arrow--open' : ''}`}>▾</span>
            </div>

            {isOpen &&
                <div className="dropdown__list">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`dropdown__option ${option.value === value ? 'dropdown__option--active' : ''} ${colorByValue ? `dropdown__option--${option.value}` : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option.value);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            }
        </div>
    );
};

export default Dropdown;
import React, { useRef } from 'react';
import styles from './textswitch.module.scss';
import { HTMLAttributes } from 'react';
import classnames from 'classnames';
import { useFormik } from 'formik';

export interface TextSwitchProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  labels: string[];
  initialState?: number;
  onChange?: (index: number) => void;
}

// Generate an array of refs based on the number of labels
const refs = (labels: string[]) => labels.map(() => useRef<HTMLDivElement>(null));

const TextSwitchDefault: React.ForwardRefRenderFunction<HTMLDivElement, TextSwitchProps> = (props) => {
  const { labels, initialState = 0, onChange } = props;

  // Generate refs for each label
  const textRefs = refs(labels);
  // Create refs for the selectedText and slider elements
  const [selectedTextRef, sliderRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [checkedIndex, setCheckedIndex] = React.useState(initialState);

  const sw = classnames(styles.switch);
  const inp = classnames(styles.input, {
    [styles['input:checked']]: true,
    [styles['input:focus']]: true,
  });

  const slider = classnames(styles.slider, styles.round);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // if right arrow is pressed
    if (event.key === 'ArrowRight') {
      // get the next index or 0 if it's the last index
      const nextIndex = checkedIndex === labels.length - 1 ? 0 : checkedIndex + 1;
      setCheckedIndex(nextIndex);
      onChange && onChange(nextIndex); // invoke callback with the new index
    } else if (event.key === 'ArrowLeft') {
      const prevIndex = checkedIndex === 0 ? labels.length - 1 : checkedIndex - 1;
      setCheckedIndex(prevIndex);
      onChange && onChange(prevIndex);
    }
  };

  const formik = useFormik({
    initialValues: { checkedIndex: initialState },
    onSubmit: values => {
      onChange && onChange(values.checkedIndex);
    },
  });

  const handleClick = (index: number) => {
    setCheckedIndex(index)
  };

  React.useEffect(() => {
    const selectedDiv = textRefs[checkedIndex].current;
    const selectedText = selectedTextRef.current;

    // Get the left offset of the slider element
    const sliderOffsetLeft: number = sliderRef.current?.offsetLeft ?? 0;

    if (selectedDiv && selectedText) {
      // Get the offsetTop and offsetLeft of the selectedDiv
      const { offsetLeft } = selectedDiv;

      // Add the slider's offsetLeft to the div's offsetLeft
      const selectedTextLeft = offsetLeft + sliderOffsetLeft;
      const divOffsetTop = selectedDiv.offsetTop;

      // Position the selectedText
      const { width } = selectedDiv.getBoundingClientRect();
      selectedText.style.left = `${selectedTextLeft}px`;
      selectedText.style.width = `${width}px`;
      selectedText.style.top = `${divOffsetTop}px`
    }
  }, [checkedIndex, formik.values.checkedIndex, selectedTextRef, sliderRef, textRefs]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={sw}>
        <input
          {...formik.getFieldProps('checkedIndex')} className={inp} checked={formik.values.checkedIndex === labels.length - 1} type="checkbox" />
        <div className={slider} ref={sliderRef}>
          <div className={styles.selectedText} ref={selectedTextRef} />
          {labels.map((item, index) => (
            <div
              ref={textRefs[index]}
              className={styles.text}
              key={index}
              onClick={() => handleClick(index)}
              onKeyDown={(event) => handleKeyDown(event)}
              tabIndex={index}
              style={{ color: index === checkedIndex ? 'red' : '' }}
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default React.forwardRef(TextSwitchDefault);

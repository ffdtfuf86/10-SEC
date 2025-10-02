import NameInput from '../NameInput';

export default function NameInputExample() {
  return (
    <NameInput 
      onSubmit={(name) => console.log('Name submitted:', name)} 
    />
  );
}

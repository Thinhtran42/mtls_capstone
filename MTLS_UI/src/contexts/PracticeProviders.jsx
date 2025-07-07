import { NoteIdentificationProvider } from './NoteIdentificationContext';
import { KeySignatureProvider } from './KeySignatureContext';
import { KeyboardIdentificationProvider } from './KeyboardIdentificationContext';
import { KeyboardNoteIdentificationProvider } from './KeyboardNoteIdentificationContext';
import { NoteListeningProvider } from './NoteListeningContext';
import { PitchIdentificationProvider } from './PitchIdentificationContext';
import PropTypes from 'prop-types';

const PracticeProviders = ({ children }) => {
  return (
    <NoteIdentificationProvider>
      <KeySignatureProvider>
        <KeyboardIdentificationProvider>
          <KeyboardNoteIdentificationProvider>
            <NoteListeningProvider>
              <PitchIdentificationProvider>
                {children}
              </PitchIdentificationProvider>
            </NoteListeningProvider>
          </KeyboardNoteIdentificationProvider>
        </KeyboardIdentificationProvider>
      </KeySignatureProvider>
    </NoteIdentificationProvider>
  );
};

PracticeProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PracticeProviders;

import useAuth from './useAuth';
import useHelper from './useHelper';

const PROTECT_SENSITIVE_CHANGES_FF = 'PROTECT_SENSITIVE_CHANGES';

const useSensitiveModifications = () => {
    const { me } = useAuth();
    const { isFeatureEnable } = useHelper();
    return {ffenabled: isFeatureEnable(PROTECT_SENSITIVE_CHANGES_FF), isSensitiveModifAllowed: me.is_sensitive_changes_allow ? me.is_sensitive_changes_allow: true};
};

export default useSensitiveModifications;
import styles from './Spinner.module.css';

interface SpinnerProps {
    variant?: 'default' | 'throb';
}

export default function Spinner({ variant = 'throb' }: SpinnerProps) {
    if (variant === 'default') {
        return (
            <div className={styles.container}>
                <div className={styles.spinner}>
                    <div></div><div></div><div></div><div></div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.heartThrob}></div>
        </div>
    );
}

export async function parseSubject(subject) {
    const parts = subject.split(".").reverse();

    const serviceName = parts[0]; 
    const checkName = parts[1]; 
    return { serviceName, checkName }
}
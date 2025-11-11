import { generateTestRegistryPackages } from "./testHelpers.js";

generateTestRegistryPackages("test/data/registry").then(() => {
	console.log("Test registry packages generated successfully.");
}).catch((err) => {
	console.error("Error generating test registry packages:", err);
	process.exit(1);
});
/*
Copyright © 2024 Delusoire <deluso7re@outlook.com>
*/
package cmd

import (
	"bespoke/module"
	"log"

	"github.com/spf13/cobra"
)

var pkgCmd = &cobra.Command{
	Use:   "pkg [action]",
	Short: "Manage modules",
	Run:   func(cmd *cobra.Command, args []string) {},
}

var pkgAddCmd = &cobra.Command{
	Use:   "add [murl]",
	Short: "Install module",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		metadataURL := args[0]
		if err := module.AddModuleMURL(metadataURL); err != nil {
			log.Fatalln(err.Error())
		}
	},
}

var pkgRemCmd = &cobra.Command{
	Use:   "rem [id]",
	Short: "Uninstall module",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		identifier := args[0]
		if err := module.RemoveModule(identifier); err != nil {
			log.Fatalln(err.Error())
		}
	},
}

var pkgEnableCmd = &cobra.Command{
	Use:   "enable [id]",
	Short: "Enable installed module",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		identifier := args[0]
		if err := module.ToggleModuleInVault(identifier, true); err != nil {
			log.Fatalln(err.Error())
		}
	},
}

var pkgDisableCmd = &cobra.Command{
	Use:   "disable [id]",
	Short: "Disable installed module",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		identifier := args[0]
		if err := module.ToggleModuleInVault(identifier, false); err != nil {
			log.Fatalln(err.Error())
		}
	},
}

func init() {
	rootCmd.AddCommand(pkgCmd)

	pkgCmd.AddCommand(pkgAddCmd, pkgRemCmd, pkgEnableCmd, pkgDisableCmd)
}
